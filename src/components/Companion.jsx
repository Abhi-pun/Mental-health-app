import { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle } from 'lucide-react';

const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end it', 'want to die', 'not worth living', 'give up on life'];

const SYSTEM_PROMPT = `You are the SafeCircle Companion — a warm, gentle AI support presence for a mental wellness platform designed for South Asian communities where mental health stigma is high.

Your role:
- Be a kind, non-judgmental first point of contact for someone who may be struggling emotionally
- Listen deeply, reflect back what you hear, validate feelings without minimizing them
- Gently guide users toward the SafeCircle community feed, the Reach button (for silent distress signals), or professional resources when appropriate
- Never diagnose, give clinical advice, or replace therapy
- If a user expresses severe distress or mentions self-harm/suicide, immediately and compassionately surface crisis resources (iCall Nepal: 9152987821, Crisis Text Line: text HOME to 741741) and encourage them to reach out

Cultural context:
- Many users come from communities where talking about mental health is taboo
- Be especially gentle and patient — this may be the first time they've ever spoken about their feelings
- Never push users to "just talk to someone" without acknowledging how hard that can be in their context

Tone: Warm, human, unhurried. Use simple language. Short to medium length responses. Never use bullet points or lists — always conversational prose.

Start by warmly greeting the user and asking how they're feeling today.`;

export default function Companion() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function getAIResponse(text) {
    const t = text.toLowerCase();
    if (text.includes("alone")) 
    {
      return "I'm really glad you shared that with me. Feeling alone can be really heavy. You're not alone here."; 
    } 
    if (text.includes("stress") || text.includes("overwhelmed"))
    {
      return "That sounds like a lot to carry. It makes sense you'd feel overwhelmed. Do you want to tell me what's been weighing on you?";
    } 
    if (text.includes("tired") || text.includes("exhausted"))
    {
      return "It sounds like you've been carrying a lot for a while. It's okay to feel tired.";
    } 
    if (text.includes("sad")) 
    { 
      return "I'm really sorry you're feeling this way. I'm here with you. Do you want to share more about what's been going on?"; 
    } 
    if (text.includes("hard time")) 
    { 
      return "I'm here with you. Do you want to suggest some activity to clear your mind? Do you like listening music or journalling?";
    } 
    return "Thank you for sharing that with me. I'm here to listen, tell me more if you'd like. :)"; 
  }

  const startChat = () => {
    setStarted(true);
    setLoading(true);
    setTimeout(() => {
      setMessages([{ role: "assistant", content: "Hi, I'm here with you. How are you feeling today?" }]);
      setLoading(false);
    }, 800);
  };

  const send = () => {
    if (!input.trim()) return;

    setLoading(true);
    const userMessage = { role: "user", content: input };

    const isCrisis = CRISIS_KEYWORDS.some(word => input.toLowerCase().includes(word));
    if (isCrisis) setCrisisDetected(true);

    const botReply = isCrisis
      ? "I'm really concerned about you. You don’t have to go through this alone. You can call iCall Nepal at 9152987821 or text HOME to 741741 to reach someone right now."
      : getAIResponse(input);

    const botMessage = { role: "assistant", content: botReply };

    // Add messages and reset input
    setMessages(prev => [...prev, userMessage, botMessage]);
    setInput("");

    setTimeout(() => setLoading(false), 500); // simulate typing delay
  };

  if (!started) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--sage-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'float 3s ease-in-out infinite' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--sage)' }} />
        </div>
        <div>
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>Your SafeCircle Companion</h2>
          <p style={{ fontSize: 15, color: 'var(--ink-mid)', maxWidth: 340, lineHeight: 1.7 }}>
            A gentle space to talk. I'll listen, reflect, and help you find your way — to the community, to resources, or just to feel less alone.
          </p>
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', maxWidth: 300 }}>
          This is not therapy. I'm a supportive companion — a first step, not a replacement for professional care.
        </p>
        <button onClick={startChat} style={{ padding: '13px 32px', borderRadius: 50, background: 'var(--sage)', color: 'white', fontSize: 15, fontWeight: 500, boxShadow: '0 4px 16px rgba(122,158,126,0.35)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
          Start talking
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '70vh', maxHeight: 600 }}>
      {/* Crisis banner */}
      {crisisDetected && (
        <div style={{ background: 'rgba(196,133,106,0.1)', border: '1px solid var(--clay-light)', borderRadius: 12, padding: '12px 16px', marginBottom: 12, display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'fadeUp 0.4s ease' }}>
          <AlertTriangle size={16} color="var(--clay)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--clay)', marginBottom: 4 }}>If you're in crisis, please reach out to someone who can help right now.</p>
            <p style={{ fontSize: 12, color: 'var(--ink-mid)' }}>iCall Nepal: <strong>9152987821</strong> · Crisis Text Line: text <strong>HOME to 741741</strong></p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 2px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeUp 0.3s ease' }}>
            {m.role === 'assistant' && (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--sage-pale)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 2 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--sage)' }} />
              </div>
            )}
            <div style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: m.role === 'user' ? 'var(--sage)' : 'var(--white)', color: m.role === 'user' ? 'white' : 'var(--ink)', fontSize: 14, lineHeight: 1.65, boxShadow: 'var(--shadow-soft)' }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeUp 0.3s ease' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--sage-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--sage)' }} />
            </div>
            <div style={{ padding: '12px 18px', background: 'var(--white)', borderRadius: '18px 18px 18px 4px', boxShadow: 'var(--shadow-soft)', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--sage-light)', animation: `breathe 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--warm-mid)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Share what's on your mind…"
          style={{ flex: 1, padding: '12px 16px', background: 'var(--white)', border: '1px solid var(--warm-mid)', borderRadius: 50, fontSize: 14, color: 'var(--ink)' }}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{ width: 44, height: 44, borderRadius: '50%', background: input.trim() && !loading ? 'var(--sage)' : 'var(--warm-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0 }}>
          <Send size={16} color="white" />
        </button>
      </div>
    </div>
  );
}
