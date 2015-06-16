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
	
	get type(): string { return this._childNames[this._childNames.length - 1]; }
	get description(): string { return ""; }
}

var _callbacks: Array<Reference> = [];
var _hierarchy: Array<string[]> = [];

export function register<T extends Message>(messageType: string, registerForSubclasses: boolean,  parentObject: any, callback: (message: T) => void): void {
	_callbacks.push(new Reference(messageType, registerForSubclasses, callback, parentObject));
}

export function registerDirect<T extends Message>(messageType: string, parentObject: any, callback: (message: T) => void): void {
	_callbacks.push(new Reference(messageType, true, callback, parentObject));
}

export function registerSubClasses<T extends Message>(messageType: string, parentObject: any, callback: (message: T) => void): void {
	_callbacks.push(new Reference(messageType, true, callback, parentObject));
}
	
export function send<T extends Message>(message: T): void {
	var hier: string[] = null;
	_hierarchy.forEach(x => {
		hier = x[x.length - 1] === message.type ? x : hier;
	});
		
	if (null != hier) {
		console.log("Sending message " +  message.type + ": " + message.description);
		
		_callbacks.forEach(c => {
			var typesToCheck: string[] = c.registerForSubclasses ? hier.slice(hier.length - 1, hier.length) : hier;
			
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