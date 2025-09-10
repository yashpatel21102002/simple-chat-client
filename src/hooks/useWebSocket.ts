"use client"
import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'

//websocket url
const WS_URL = process.env.WS_URL || "ws://localhost:8080";

//type of hook
export interface WebSocketHook {
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
    sendMessage: (message: unknown) => void;
    lastMessage: WebSocketMessage | null;
    messages: ChatMessage[];
}

//message 
export interface WebSocketMessage {
    type: string;
    [key: string]: string;
}

//messagebody
export interface ChatMessage {
    type: 'chat',
    name: string;
    message: string;
    timestamp?: number;
}


export const useWebSocket = (): WebSocketHook => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const ws = useRef<WebSocket | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 3;

    const connect = useCallback(() => {
        if (ws.current?.readyState === WebSocket.OPEN) return;

        try {
            ws.current = new WebSocket(WS_URL);

            //on success
            ws.current.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                reconnectAttempts.current = 0
            }

            //on message (main logic)
            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    console.log('Received:', data);
                    setLastMessage(data);

                    //Handle different message types
                    switch (data.type) {

                        //1 room creation
                        case 'room-created':
                            //copy room code to clipboard
                            navigator.clipboard.writeText(data.roomId);
                            toast('Room Created!', {
                                description: `Code ${data.roomId} copied to clipboard`
                            })
                            break;

                        //2. room joining
                        case 'room-joined':
                            toast("Joined Room", {
                                description: `Succesfully joined room ${data.roomId}`
                            })
                            break;

                        //3. any other user joined
                        case 'user-joined':
                            toast("User Joined", {
                                description: `${data.name} joined the chat`
                            })
                            break;

                        //4. any user left
                        case 'user-left':
                            toast("User left", {
                                description: `${data.name} left the chat`
                            })
                            break;

                        //5. any message has come
                        case 'chat':
                            setMessages(prev => [...prev, { ...data, timestamp: Date.now() }]);
                            break;

                        //6. any error has come
                        case 'error':
                            toast.error('Error', {
                                description: `${data.message}`
                            })
                            break;

                    }
                } catch (e) {
                    console.log('Error pasrsing websocket message', e)
                }
            }

            //on close 
            ws.current.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);

                // Attempt to reconnect
                if (reconnectAttempts.current < maxReconnectAttempts) {
                    reconnectAttempts.current++;
                    setTimeout(() => {
                        connect();
                    }, 1000 * reconnectAttempts.current);
                } else {
                    toast.error("Connection lost", {

                        description: "Unable to reconnect to server"
                    });
                }
            };

            //on error
            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                toast("Connection error", {
                    description: "Failed to connect to chat server"

                });
            };
        } catch (e) {
            console.log('Websocket Error', e)
            toast.error('Connection Error', {
                description: "Unable to connect to chat server"
            })
        }
    }, [])

    //disconnect
    const disconnect = useCallback(() => {
        if (ws.current) {
            ws.current.close()
            ws.current = null
        }

        setIsConnected(false);
        setMessages([])
    }, [])

    const sendMessage = useCallback((message: unknown) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
            console.log('Sent:', message);

        } else {
            toast.error('Connection Error', {
                description: 'Not connected to server'
            })
        }
    }, []);

    useEffect(() => {
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        }
    }, [])

    return {
        isConnected,
        connect,
        disconnect,
        sendMessage,
        lastMessage,
        messages
    }
}

