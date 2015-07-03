class Reference
{
	constructor(public messageType: string, public registerForSubclasses: boolean, public callback: Function, public parentObject: any = null) { }
}

export class Message {
	private _childNames: string[];
	
	constructor(childNames: string[]) {
		this._childNames = childNames;
		var registered = false;
		var self = this;
		
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
	get description(): string { return ""; }
}

var _callbacks: Array<Reference> = [];
var _hierarchy: Array<string[]> = [];

export interface RegistrationOptions {
	registerForSubclasses?: boolean;
	thisArg?: any;
};

export function register<T extends Message>(messageType: string, options: RegistrationOptions, callback?: (message: T) => void): void {
	var haveOptions =  (typeof options !== "undefined" && options !== null);
	_callbacks.push(new Reference(messageType, 
		haveOptions ? options.registerForSubclasses : false, 
		callback, 
		haveOptions ? options.thisArg: null));
}	

export function unregister<T extends Message>(messageTypeOrTarget: string|any = undefined): void {
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
	
export function send<T extends Message>(message: T): void {
	var hier: string[] = null;
	_hierarchy.forEach(x => {
		hier = x[x.length - 1] === message.type ? x : hier;
	});
		
	if (null != hier) {
		console.log("Sending message " +  message.type + ": " + message.description);
		
		_callbacks.forEach(c => {
			var typesToCheck: string[] = c.registerForSubclasses ? hier : hier.slice(hier.length - 1, hier.length);
			
			typesToCheck.forEach(messageType => {
				if (c.messageType === messageType) {
					if (c.parentObject == null) {
						c.callback(message);
					} else {
						c.callback.bind(c.parentObject)(message);
					}
				}
			});
		});
	} else {
		console.log("No such message registered: " + message.type);
	}
}