import { useEffect, useRef } from "react";
import useURL from "./useUrl";

export interface EventSourceProps {
    onmessage?: (message : string) => void
}

export default function useEventSource({
    onmessage
} : EventSourceProps) {
    const eventSourceRef = useRef<EventSource>(null)
    const { url } = useURL()

    useEffect(() => {
        if (eventSourceRef.current == null) {
            eventSourceRef.current = new EventSource(`${url}/log`);

            if (typeof onmessage !== 'undefined') {
                eventSourceRef.current.onmessage = (ev) => {
                    onmessage(ev.data);
                }
            }
        }
    }, []);
}