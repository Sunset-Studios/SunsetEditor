class DispatcherEvent {
    event_name: string
    callbacks: any[]

    constructor(event_name: string = "") {
        this.event_name = event_name
        this.callbacks = []
    }

    register(callback: any) {
        this.callbacks.push(callback)
    }

    unregister(callback: any) {
        const index = this.callbacks.indexOf(callback)
        if (index != -1)
        {
            this.callbacks.splice(index, 1)
        }
    }

    broadcast(...data: any[]) {
        const callbacks = this.callbacks.slice(0)
        for (const callback of callbacks)
        {
            callback(...data)
        }
    }
}

class Dispatcher {
    events: any

    constructor() {
        this.events = {}
    }

    dispatch(event_name: string, ...data: any) {
        if (this.events[event_name]) {
            this.events[event_name].broadcast(...data)
        }
    }
    
    on(event_name: string, callback: any) {
        if (!(event_name in this.events)) {
            this.events[event_name] = new DispatcherEvent(event_name)
        }
        this.events[event_name].register(callback)
    }

    off (event_name: string, callback: any) {
        if (this.events[event_name]) {
            this.events[event_name].unregister(callback)
        }
        if (this.events[event_name].callbacks.length === 0) {
            delete this.events[event_name]
        }
    }
}

const global_dispatcher: Dispatcher = new Dispatcher()

export function get_global_dispatcher()
{
    return { global_dispatcher }
}