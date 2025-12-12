import Link from "next/link";

export default function Home() {
    return (
        <div style={{ padding: 40 }}>
            <h1>Career Path Simulator</h1>
            <Link href="/mentor">Start with AI Mentor</Link>
        </div>
    );
}
