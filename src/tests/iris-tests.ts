/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/should/should.d.ts" />

import should = require("should");
import iris = require("../iris");

class MyMessage extends iris.Message {
   static name: string = "MyMessage";
   get description() : string { return this.paramOne.toString(); }
   get paramOne(): boolean { return this._paramOne; }
   
   constructor(private _paramOne: boolean, childNames: string[] = []) {
     super(super.derive(childNames, MyMessage.name));
   }
}

class MyDerivedMessage extends MyMessage {
  static name: string = "MyDerivedMessage";
  get description() : string { return [this.paramOne.toString(), this.paramTwo.toString()].join(); }
  get paramTwo(): Number { return this._paramTwo; }
  
  constructor(_paramOne: boolean, private _paramTwo: Number, childNames: string[] = []) {
     super(_paramOne, super.derive(childNames, MyDerivedMessage.name));
  }
}

class Target {
  private _lastMyMessage: MyMessage;
  get lastMyMessage(): MyMessage { return this._lastMyMessage; }
  
  private _lastMyMessageOrDerived: MyMessage;
  get lastMyMessageOrDerived(): MyMessage { return this._lastMyMessageOrDerived; }
  
  private _lastMyDerivedMessage: MyDerivedMessage;
  get lastMyDerivedMessage(): MyDerivedMessage { return this._lastMyDerivedMessage; }
  
  constructor() {
    iris.register(MyMessage.name, { thisArg: this }, this.OnMyMessage);
    iris.register(MyDerivedMessage.name, { thisArg: this, registerForSubclasses: true }, this.OnMyMessageOrDerived);
    iris.register(MyDerivedMessage.name, { thisArg: this }, this.OnMyDerivedMessage);
  }
  
  private OnMyMessage(msg: MyMessage): void {
    this._lastMyMessage = msg;
  }
  
  private OnMyDerivedMessage(msg: MyDerivedMessage): void {
    this._lastMyDerivedMessage = msg;
  }
  
  private OnMyMessageOrDerived(msg: MyDerivedMessage): void {
    this._lastMyMessageOrDerived = msg;
  }
}

describe('Iris', () => {
  it("Correctly handle message type", () => {
    var message = new MyDerivedMessage(false, 1);
    should.equal(message.type, "MyDerivedMessage");
    should.equal(message.description, "false,1");
  }),
  
  it("Doesn't receive messages after unregister all", () => {
      var receivedMessage: MyMessage = null;
      
      iris.register(MyMessage.name, null, (msg: MyMessage) => { receivedMessage = msg; });
      iris.unregister();
      
      iris.send(new MyMessage(true));      
     
      should.equal(receivedMessage, null); 
  }),
  
  describe('Registration without target object', () => {
    it('does receive direct message', () => {
      var receivedMessage: MyMessage = null;
      
      iris.register(MyMessage.name, null, (msg: MyMessage) => { receivedMessage = msg; });
      iris.send(new MyMessage(true));      
      iris.unregister();
     
      should.notEqual(receivedMessage, null); 
    }),
    it("doesn't receive direct message after unregistrering", () => {
      var receivedMessage: MyMessage = null;
      
      iris.register(MyMessage.name, null, (msg: MyMessage) => { receivedMessage = msg; });
      iris.unregister(MyMessage.name);
      
      iris.send(new MyMessage(true));      
     
      should.equal(receivedMessage, null); 
    }),
    it("doesn't receive derived message if not subscribed", () => {
      var receivedMessage: MyMessage = null;
      
      iris.register(MyMessage.name, null, (msg: MyMessage) => { receivedMessage = msg; });
      iris.send(new MyDerivedMessage(true, 1));    
      iris.unregister();  
     
      should.equal(receivedMessage, null); 
    }),
    it("does receive derived message if subscribed", () => {
      var receivedMessage: MyMessage = null;
      
      iris.register(MyMessage.name, { registerForSubclasses: true }, (msg: MyMessage) => { receivedMessage = msg; });
      iris.send(new MyDerivedMessage(true, 1));  
      iris.unregister();    
     
      should.notEqual(receivedMessage, null); 
    })
  }),
  
  describe('Registration with target object', () => {
    it('does receive direct message', () => {
      var target = new Target();
      
      iris.send(new MyMessage(true));      
      iris.unregister();
     
      should.notEqual(target.lastMyMessage, null); 
    }),
    it("doesn't receive direct message after unregistrering message", () => {
      var target = new Target();
      
      iris.unregister(MyMessage.name);
      
      iris.send(new MyMessage(true));      
     
      should.equal(target.lastMyMessage, null); 
    }),
    it("doesn't receive direct message after unregistrering target", () => {
      var target = new Target();
      
      iris.unregister(target);
      iris.send(new MyMessage(true));      
     
      should.equal(target.lastMyMessage, null); 
    }),
    it("doesn't receive derived message if not subscribed", () => {
      var target = new Target();
      
      iris.send(new MyDerivedMessage(true, 1));      
      iris.unregister();
     
      should.equal(target.lastMyMessage, null); 
    }),
    it("does receive derived message if subscribed", () => {
      var target = new Target();
      
      iris.send(new MyDerivedMessage(true, 1));  
      iris.unregister();    
     
      should.notEqual(target.lastMyMessageOrDerived, null); 
    })
  })
  
})