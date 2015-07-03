"use strict";

class Reference
{
	constructor(public messageType: string, public registerForSubclasses: boolean, public callback: Function, public parentObject: any) { }
}

export interface IMessage {
	type: string;
	description?: string;
	isLogging?: boolean;
}

export interface IRegistrationOptions {
	type: string;
	registerForSubclasses?: boolean;
	thisArg?: any;
};

export interface IOptions {
	logError: (message:string) => void;
	logMessage: (message: string) => void;
}

export class Message implements IMessage {
	private _childNames: string[];
	
	constructor(childNames: string[]) {
		this._childNames = childNames;
		
		var self = this;
		var registered = false;
	
		_hierarchy.forEach(x => {
			registered = x[x.length - 1] === self.type ? true : registered;
		});
		
		if (!registered) {
			_hierarchy.push(childNames);
		}
	}
	
	derive(childNames: string[], name: string): string[] {
		var result = childNames.slice(0);
		result.splice(0, 0, name);
		return result;
	}
	
	get type(): string { return this._childNames[this._childNames.length - 1]; }
	get isLogging(): boolean { return true; }
}

var _callbacks: Array<Reference> = [];
var _hierarchy: Array<string[]> = [];

export var options: IOptions = {
	logError: (message: string) => { console.log(message); },
	logMessage: (message: string) => { console.log(message); }	
};

export function register<T extends IMessage>(message: string|IRegistrationOptions, callback: (message: T) => void): void {
	var msg: IRegistrationOptions = typeof message === "string" ? { type: message } : message;
		
	_callbacks.push(new Reference(msg.type, 
		msg.registerForSubclasses || false, 
		callback, 
		msg.thisArg || null));
}	

export function unregister<T extends IMessage>(messageTypeOrTarget: string|any = undefined): void {
	if (typeof messageTypeOrTarget === "undefined" || messageTypeOrTarget === null) {
		_callbacks = [];
	} else {
		var messageIndex = -1;
		
		do {
			messageIndex = -1;
			_callbacks.forEach((c, index) => {
				if (c.messageType == messageTypeOrTarget || c.parentObject == messageTypeOrTarget) {
					messageIndex = index;
				}
			});
			
			if (messageIndex != -1) {
				_callbacks.splice(messageIndex, 1);
			}
		} while (messageIndex != -1);
	}
}
	
export function send<T extends IMessage>(message: T|string, body?: any): void {
	var hier: string[] = null;
	var haveBody = typeof body !== "undefined";
	var msg: IMessage;
	var haveReceivers = false;
	
	if (typeof message === "string") {
		msg = { type: message, isLogging: true, description: null, parentObject: null };
		hier = [message];
	} else {
		msg = message;
		
		_hierarchy.forEach(x => {
			hier = x[x.length - 1] === msg.type ? x : hier;
		});
	}

	if (null != hier) {
		if (msg.isLogging) {
			options.logMessage("Sending message " +  msg.type + ": " + msg.description);
		}
		
		_callbacks.forEach(c => {
			var typesToCheck: string[] = c.registerForSubclasses ? hier : hier.slice(hier.length - 1, hier.length);
			
			typesToCheck.forEach(messageType => {
				if (c.messageType === messageType) {
					if (c.parentObject == null) {
						c.callback(haveBody ? body : message);
					} else {
						c.callback.bind(c.parentObject)(haveBody ? body : message);
					}
					
					haveReceivers = true;
				}
			});
		});
	} 
	
	if (!haveReceivers) {
		options.logError("No such message registered: " + msg.type);
	}
}