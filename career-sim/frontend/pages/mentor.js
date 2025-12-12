import { useEffect, useRef, useState } from "react";

export default function Mentor() {
    const [chat, setChat] = useState([]);
    const [input, setInput] = useState("");
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8000/mentor");
        ws.current.onmessage = e => {
            setChat(c => [...c, { from: "AI", text: e.data }]);
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, []);

    const send = () => {
        ws.current.send(input);
        setChat(c => [...c, { from: "You", text: input }]);
        setInput("");
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>AI Career Mentor</h2>
            <div style={{ height: 300, overflowY: "auto", border: "1px solid #ccc", marginBottom: 10, padding: 10 }}>
                {chat.map((m, i) => (
                    <div key={i}><b>{m.from}:</b> {m.text}</div>
                ))}
            </div>
            <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                style={{ width: "80%", marginRight: 10 }}
            />
            <button onClick={send}>Send</button>
        </div>
    );
}
