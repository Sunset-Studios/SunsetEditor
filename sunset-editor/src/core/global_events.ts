class DispatcherEvent {
  event_name: string;
  callbacks: any[];

  constructor(event_name: string = "") {
    this.event_name = event_name;
    this.callbacks = [];
  }

  register(callback: any) {
    this.callbacks.push(callback);
  }

  unregister(callback: any) {
    const index = this.callbacks.indexOf(callback);
    if (index != -1) {
      this.callbacks.splice(index, 1);
    }
  }

  broadcast(...data: any[]) {
    const callbacks = this.callbacks.slice(0);
    for (const callback of callbacks) {
      callback(...data);
    }
  }
}

class Dispatcher {
  events: any;

  constructor() {
    this.events = {};
  }

  dispatch(event_name: string, ...data: any) {
    if (this.events[event_name]) {
      this.events[event_name].broadcast(...data);
    }
  }

  on(event_name: string, callback: any) {
    if (!(event_name in this.events)) {
      this.events[event_name] = new DispatcherEvent(event_name);
    }
    this.events[event_name].register(callback);
  }

  off(event_name: string, callback: any) {
    if (this.events[event_name]) {
      this.events[event_name].unregister(callback);
    }
    if (this.events[event_name].callbacks.length === 0) {
      delete this.events[event_name];
    }
  }
}

const global_dispatcher: Dispatcher = new Dispatcher();

export function get_global_dispatcher() {
  return { global_dispatcher };
}

const registered_listeners: Map<any, { event: string, listener: any }[]> = new Map();

export function add_listener(node: any, event: string, listener: any) {
  node.addEventListener(event, listener);
  if (!registered_listeners.has(node)) {
    registered_listeners.set(node, []);
  }
  registered_listeners.get(node)!.push({ event, listener });
}

export function remove_listener(node: any, event: string, listener: any) {
  node.removeEventListener(event, listener);
  if (registered_listeners.has(node)) {
    registered_listeners.set(node, registered_listeners.get(node)!.filter(
      (ev: any) => ev.event !== event || ev.listener !== listener
    ));
    if (registered_listeners.get(node)!.length === 0) {
      registered_listeners.delete(node);
    }
  }
}

export function get_all_listeners(node: any) {
  return registered_listeners.get(node) || [];
}

export function copy_event_listeners(src: any, dest: any) {
  const events = get_all_listeners(src);
  for (const { event, listener } of events) {
    add_listener(dest, event, listener);
  }

  const src_children = src.children;
  const dest_children = dest.children;

  if (src_children && dest_children && src_children.length === dest_children.length) {
    for (let i = 0; i < src_children.length; i++) {
      copy_event_listeners(src_children[i], dest_children[i]);
    }
  }
}
