import { useState, useEffect, useCallback } from 'react';
import { Flag, Heart, MessageCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { mapRowToPost } from '../lib/feedPosts';
import { useAuth } from '../context/AuthContext';

const TAGS = [
  { id: 'all',      label: 'All' },
  { id: 'family',   label: 'Family Pressure' },
  { id: 'study_abroad', label: 'Studying Abroad' },
  { id: 'marriage', label: 'Marriage' },
  { id: 'financial', label: 'Financial Stress' },
  { id: 'loneliness',   label: 'Loneliness' },
  { id: 'hope',     label: 'Hope' },
  { id: 'burnout',  label: 'Burned out' },
  { id: 'lost',     label: 'Feeling lost' },
  { id: 'overwhelmed', label: 'Overwhelmed' },
  { id: 'miscellaneous', label: 'Miscellaneous' },
];

const TAG_COLORS = {
  lost:        { bg: '#EEEAF8', text: '#9B8EC4', border: '#C8BEE8' },
  overwhelmed: { bg: '#FDF0E8', text: '#C4856A', border: '#EAC4B3' },
  family:      { bg: '#EBF2EC', text: '#5C8C60', border: '#A8C5AC' },
  burnout:     { bg: '#FEF3E8', text: '#E8A87C', border: '#F0D0A8' },
  hope:        { bg: '#E8F4F8', text: '#5B8FA8', border: '#A8D0E0' },
  lonely:      { bg: '#F2EBF2', text: '#A87CA8', border: '#D0A8D0' },
  marriage:    { bg: '#F8EBEE', text: '#A86B78', border: '#E8C4CC' },
  study_abroad:{ bg: '#E8EEF8', text: '#5B6FA8', border: '#B8C4E8' },
  financial:   { bg: '#F5F0E8', text: '#8B7355', border: '#D8C8A8' },
  academic:    { bg: '#ECEAF8', text: '#6B5BA8', border: '#C4BEE8' },
  loneliness:  { bg: '#EDE8F2', text: '#7A6B8C', border: '#C8BED8' },
  miscellaneous: { bg: '#F0F0F0', text: '#6B6B6B', border: '#D8D8D8' },
};

const SEED_POSTS = [
  {
    id: 1, tag: 'family', time: '12 min ago', relates: 14,
    text: "I haven't been able to tell my parents what I'm going through. In our culture you just don't talk about these things. It's like there's no space to even feel sad without someone saying \"just be grateful\".",
    replies: [
      { id: 1, text: "The 'just be grateful' thing hits so hard. You're allowed to feel both grateful and sad at the same time." },
      { id: 2, name: 'Verified supporter', text: "What you're feeling is valid. This space exists exactly for moments like this." },
    ],
  },
  {
    id: 2, tag: 'burnout', time: '1 hr ago', relates: 31,
    text: "Finished my exams but I feel nothing. Everyone around me is celebrating and I'm just... empty. I don't know if something is wrong with me.",
    replies: [],
  },
  {
    id: 3, tag: 'overwhelmed', time: '2 hr ago', relates: 22,
    text: "I've been telling myself 'just get through this week' for three months straight. I don't know when the week I can actually breathe is coming.",
    replies: [
      { id: 1, text: "Three months of 'just one more week' is exhausting. Your body and mind are trying to tell you something." },
    ],
  },
  {
    id: 4, tag: 'hope', time: '4 hr ago', relates: 89,
    text: "Six months ago I posted here when I was at my lowest. Today I had a real conversation with my sister about how I was feeling. Small thing. Felt huge. Thank you, SafeCircle.",
    replies: [
      { id: 1, text: "This is why this place exists. Thank you for coming back to share it. 💚" },
      { id: 2, text: "This made me tear up. So happy for you." },
    ],
  },
  {
    id: 5, tag: 'study_abroad', time: '5 hr ago', relates: 17,
    text: "First in my family to study abroad. Everyone is proud. Nobody asks if I'm okay. I smile on video calls so they don't worry. I don't know how to tell them I'm not okay.",
    replies: [],
  },
  {
    id: 6, tag: 'family', time: '25 min ago', relates: 41,
    text: "Told my family I'm stressed and they said 'others have it worse.'",
    replies: [
      { id: 1, text: "That sentence hurts more than they realize." },
      { id: 2, text: "Your pain doesn't need comparison to be valid." },
    ],
  },
  {
    id: 7, tag: 'family', time: '3 hr ago', relates: 56,
    text: "My parents think mental health is just an excuse. I can't talk to them about anything.",
    replies: [
      { id: 1, text: "Same here. In my house, 'just pray' is the solution to everything." },
      { id: 2, text: "You're not wrong for feeling this way. It's just hard in our culture." },
    ],
  },
  {
    id: 8, tag: 'study_abroad', time: '18 min ago', relates: 38,
    text: "I moved abroad for studies and I've never felt this alone.",
    replies: [
      { id: 1, text: "Same. Everyone thinks it's a dream life but it's actually really hard." },
      { id: 2, text: "You left your whole support system behind. That's not easy." },
    ],
  },
  {
    id: 9, tag: 'study_abroad', time: '1 hr ago', relates: 52,
    text: "If I fail, all the money my family spent on me is wasted.",
    replies: [
      { id: 1, text: "That guilt is so heavy." },
      { id: 2, text: "You are not an investment. You're a person." },
    ],
  },
  {
    id: 10, tag: 'study_abroad', time: '6 hr ago', relates: 44,
    text: "I feel like I'm failing at everything. Everyone else is doing better than me.",
    replies: [
      { id: 1, text: "I used to feel like that every semester. Turns out everyone is just pretending to have it together." },
      { id: 2, text: "You're not behind. You're just on your own timeline." },
    ],
  },
  {
    id: 11, tag: 'family', time: '45 min ago', relates: 29,
    text: "I don't feel safe talking about my feelings in my own house.",
    replies: [
      { id: 1, text: "That's more common than people admit." },
      { id: 2, text: "I'm glad you said it somewhere, even if it's here." },
    ],
  },
  {
    id: 12, tag: 'financial', time: '2 hr ago', relates: 63,
    text: "My whole family depends on me to succeed. I feel like I can't fail.",
    replies: [
      { id: 1, text: "That kind of pressure is heavy to carry alone." },
      { id: 2, text: "You're a person, not just their expectations." },
    ],
  },
  {
    id: 13, tag: 'burnout', time: '33 min ago', relates: 71,
    text: "I'm so tired. Not physically… just tired of everything.",
    replies: [
      { id: 1, text: "That kind of tired needs rest, not sleep." },
      { id: 2, text: "You don't have to keep pushing every day." },
    ],
  },
  {
    id: 14, tag: 'loneliness', time: '50 min ago', relates: 48,
    text: "Does anyone else get overwhelmed at night for no reason?",
    replies: [
      { id: 1, text: "Nighttime is when my brain decides to ruin everything." },
      { id: 2, text: "You're not the only one awake feeling this." },
    ],
  },
  {
    id: 15, tag: 'family', time: '1 hr ago', relates: 54,
    text: "My relatives keep comparing me to others and I feel like I'm never enough.",
    replies: [
      { id: 1, text: "Relatives can be brutal without realizing it." },
      { id: 2, text: "You're not here to compete with anyone." },
    ],
  },
];

function TagPill({ tag, small }) {
  const c = TAG_COLORS[tag] || { bg: '#F0F0F0', text: '#8A8A8A', border: '#D0D0D0' };
  const label = TAGS.find(t => t.id === tag)?.label || tag;
  return (
    <span style={{
      fontSize: small ? 10 : 11, fontWeight: 500,
      padding: small ? '2px 8px' : '3px 10px',
      borderRadius: 50,
      background: c.bg, color: c.text,
      border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

function PostCard({ post, onRelate, onReply, writesEnabled }) {
  const [related, setRelated] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [reported, setReported] = useState(false);

  const handleRelateClick = () => {
    if (related || !writesEnabled) return;
    setRelated(true);
    onRelate(post.id);
  };

  const handleReplySend = async () => {
    if (!replyText.trim() || !writesEnabled) return;
    const t = replyText.trim();
    setReplyText('');
    await onReply(post.id, t);
  };

  return (
    <article style={{
      padding: '20px 24px',
      borderBottom: '1px solid var(--warm-mid)',
      animation: 'fadeUp 0.35s ease',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--warm-mid)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: 'var(--ink-soft)',
            letterSpacing: '0.02em',
          }}>
            AN
          </div>
          <div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>anonymous</span>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)', marginLeft: 6 }}>· {post.time}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TagPill tag={post.tag} />
          <button onClick={() => setReported(true)} style={{
            background: 'none', padding: 4,
            color: reported ? 'var(--clay)' : 'var(--ink-soft)',
            opacity: 0.5, transition: 'color 0.2s, opacity 0.2s',
          }}>
            <Flag size={12} />
          </button>
        </div>
      </div>

      {/* Text */}
      <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink)', marginBottom: 14 }}>
        {post.text}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <button onClick={handleRelateClick} disabled={!writesEnabled} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'none', fontSize: 12,
          color: related ? 'var(--sage)' : 'var(--ink-soft)',
          fontWeight: related ? 500 : 400,
          transition: 'color 0.2s',
          opacity: writesEnabled ? 1 : 0.45,
          cursor: writesEnabled ? 'pointer' : 'not-allowed',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: related ? 'var(--sage)' : 'var(--warm-dark)',
            transition: 'background 0.2s',
          }} />
          {post.relates} {post.relates === 1 ? 'person relates' : 'people relate'}
        </button>
        <button onClick={() => setShowReplies(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'none', fontSize: 12, color: 'var(--ink-soft)',
        }}>
          <MessageCircle size={13} />
          Reply
        </button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'none', fontSize: 12, color: 'var(--ink-soft)',
        }}>
          <Heart size={13} />
          Share experience
        </button>
      </div>

      {/* Replies */}
      {showReplies && (
        <div style={{ marginTop: 16 }}>
          {post.replies.map(r => (
            <div key={r.id} style={{
              padding: '10px 14px', marginBottom: 8,
              background: 'var(--warm)', borderRadius: 'var(--radius-md)',
              fontSize: 13, color: 'var(--ink-mid)',
              borderLeft: '2px solid var(--sage-light)',
              animation: 'fadeUp 0.3s ease',
            }}>
              {r.name && (
                <span style={{ fontSize: 11, color: 'var(--sage)', fontWeight: 600, display: 'block', marginBottom: 3 }}>
                  {r.name}
                </span>
              )}
              {r.text}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReplySend()}
              placeholder="Reply anonymously…"
              style={{
                flex: 1, padding: '9px 14px',
                background: 'var(--warm)',
                border: '1px solid var(--warm-mid)',
                borderRadius: 50, fontSize: 13, color: 'var(--ink)',
              }}
            />
            <button
              onClick={handleReplySend}
              disabled={!writesEnabled}
              style={{
                padding: '9px 18px', borderRadius: 50,
                background: replyText.trim() && writesEnabled ? 'var(--sage)' : 'var(--warm-mid)',
                color: 'white', fontSize: 13, fontWeight: 500,
                transition: 'background 0.2s',
                opacity: writesEnabled ? 1 : 0.6,
                cursor: writesEnabled ? 'pointer' : 'not-allowed',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default function Feed() {
  const { userId, isAnonymousUser, isConfigured: authConfigured } = useAuth();
  const [activeTag, setActiveTag] = useState('all');
  const [posts, setPosts] = useState(() => (isSupabaseConfigured ? [] : SEED_POSTS));
  const [loadingPosts, setLoadingPosts] = useState(isSupabaseConfigured);
  const [dbError, setDbError] = useState(null);
  const [persistToSupabase, setPersistToSupabase] = useState(false);
  const [composing, setComposing] = useState(false);
  const [newText, setNewText] = useState('');
  const [newTag, setNewTag] = useState('overwhelmed');
  const [reachBanner] = useState(true);

  const canWriteDb = persistToSupabase && Boolean(userId);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoadingPosts(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, created_at, tag, body, relates_count, replies ( id, body, display_name, created_at )')
          .order('created_at', { ascending: false });
        if (cancelled) return;
        if (error) throw error;
        setPosts((data || []).map(mapRowToPost));
        setPersistToSupabase(true);
        setDbError(null);
      } catch (e) {
        if (!cancelled) {
          setDbError(e.message || 'Could not load posts from Supabase.');
          setPosts(SEED_POSTS);
          setPersistToSupabase(false);
        }
      } finally {
        if (!cancelled) setLoadingPosts(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleRelate = useCallback((postId) => {
    if (persistToSupabase && supabase && userId) {
      supabase.rpc('increment_post_relates', { target_id: postId }).then(({ error }) => {
        if (error) console.error(error);
      });
    }
    setPosts((ps) =>
      ps.map((p) => (p.id === postId ? { ...p, relates: p.relates + 1 } : p)),
    );
  }, [persistToSupabase, userId]);

  const handleReply = useCallback(async (postId, text) => {
    if (persistToSupabase && supabase) {
      if (!userId) return;
      const { data, error } = await supabase
        .from('replies')
        .insert({ post_id: postId, body: text, user_id: userId })
        .select('id, body, display_name')
        .single();
      if (error) {
        console.error(error);
        return;
      }
      setPosts((ps) =>
        ps.map((p) =>
          p.id === postId
            ? {
                ...p,
                replies: [
                  ...p.replies,
                  { id: data.id, text: data.body, name: data.display_name || undefined },
                ],
              }
            : p,
        ),
      );
      return;
    }
    setPosts((ps) =>
      ps.map((p) =>
        p.id === postId
          ? { ...p, replies: [...p.replies, { id: Date.now(), text }] }
          : p,
      ),
    );
  }, [persistToSupabase, userId]);

  const handlePost = async () => {
    if (!newText.trim()) return;
    const body = newText.trim();
    if (persistToSupabase && supabase) {
      if (!userId) return;
      const { data, error } = await supabase
        .from('posts')
        .insert({ tag: newTag, body, user_id: userId })
        .select('id, created_at, tag, body, relates_count')
        .single();
      if (error) {
        console.error(error);
        return;
      }
      setPosts((p) => [mapRowToPost({ ...data, replies: [] }), ...p]);
    } else {
      setPosts((p) => [
        { id: Date.now(), tag: newTag, time: 'just now', relates: 0, text: body, replies: [] },
        ...p,
      ]);
    }
    setNewText('');
    setComposing(false);
  };

  const filtered = activeTag === 'all' ? posts : posts.filter(p => p.tag === activeTag);

  return (
    <div>
      {/* Top bar */}
      <div style={{
        padding: '20px 24px 0',
        borderBottom: '1px solid var(--warm-mid)',
        position: 'sticky', top: 0,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 22, color: 'var(--ink)', marginBottom: 2 }}>Community feed</h2>
            <p style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              anonymous • safe • real
              {persistToSupabase && (
                <span style={{ marginLeft: 8, color: 'var(--sage)' }}>· saved</span>
              )}
              {persistToSupabase && authConfigured && userId && (
                <span style={{ marginLeft: 8, color: 'var(--ink-mid)' }}>
                  · {!isAnonymousUser ? 'account' : 'private session'}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setComposing(v => !v)}
            style={{
              padding: '9px 20px', borderRadius: 50,
              background: 'var(--sage)', color: 'white',
              fontSize: 13, fontWeight: 500,
              boxShadow: '0 2px 12px rgba(92,140,96,0.3)',
              transition: 'opacity 0.2s',
            }}
          >
            + Post
          </button>
        </div>

        {/* Tag filters */}
        <div style={{
          display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 14,
          scrollbarWidth: 'none',
        }}>
          {TAGS.map(t => (
            <button key={t.id} onClick={() => setActiveTag(t.id)} style={{
              padding: '6px 14px', borderRadius: 50, whiteSpace: 'nowrap',
              fontSize: 12, fontWeight: activeTag === t.id ? 500 : 400,
              background: activeTag === t.id ? 'var(--sage)' : 'var(--warm)',
              color: activeTag === t.id ? 'white' : 'var(--ink-mid)',
              border: `1px solid ${activeTag === t.id ? 'transparent' : 'var(--warm-mid)'}`,
              transition: 'var(--transition)',
              flexShrink: 0,
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compose */}
      {composing && (
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--warm-mid)',
          background: 'var(--sage-pale)',
          animation: 'fadeUp 0.3s ease',
        }}>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 10, fontStyle: 'italic' }}>
            You're posting anonymously. No name, no judgment.
          </p>
          <textarea
            autoFocus
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Share how you're feeling anonymously…"
            rows={3}
            style={{
              width: '100%', padding: '12px 14px',
              background: 'white',
              border: '1px solid var(--sage-mid)',
              borderRadius: 'var(--radius-md)',
              fontSize: 14, color: 'var(--ink)',
              resize: 'none', lineHeight: 1.6,
            }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
            <select
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              style={{
                padding: '7px 12px', borderRadius: 50,
                border: '1px solid var(--warm-mid)',
                background: 'white', fontSize: 12, color: 'var(--ink-mid)',
              }}
            >
              {TAGS.filter(t => t.id !== 'all').map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button onClick={() => setComposing(false)} style={{
                padding: '8px 16px', borderRadius: 50, background: 'white',
                border: '1px solid var(--warm-mid)', fontSize: 12, color: 'var(--ink-soft)',
              }}>
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={persistToSupabase && !canWriteDb}
                style={{
                  padding: '8px 20px', borderRadius: 50,
                  background: newText.trim() && (!persistToSupabase || canWriteDb) ? 'var(--sage)' : 'var(--warm-mid)',
                  color: 'white', fontSize: 12, fontWeight: 500, transition: 'background 0.2s',
                  opacity: persistToSupabase && !canWriteDb ? 0.7 : 1,
                  cursor: persistToSupabase && !canWriteDb ? 'not-allowed' : 'pointer',
                }}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {dbError && (
        <div style={{
          margin: '12px 24px 0',
          padding: '10px 14px',
          background: '#FDF6F0',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #E8C4B3',
          fontSize: 13,
          color: 'var(--ink-mid)',
        }}>
          {dbError} Showing sample posts offline.
        </div>
      )}

      {loadingPosts && (
        <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: 14 }}>
          Loading posts…
        </div>
      )}

      {/* Reach banner */}
      {!loadingPosts && reachBanner && (
        <div style={{
          margin: '16px 24px',
          padding: '14px 16px',
          background: 'var(--sage-pale)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--sage-mid)',
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'fadeUp 0.4s ease',
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: 'var(--sage)', flexShrink: 0,
            animation: 'breathe 2s ease-in-out infinite',
          }} />
          <p style={{ fontSize: 13, color: 'var(--ink-mid)', flex: 1, lineHeight: 1.5 }}>
            Someone in your community just reached out. They need support right now.
          </p>
          <button style={{
            padding: '6px 14px', borderRadius: 50,
            background: 'var(--sage)', color: 'white',
            fontSize: 12, fontWeight: 500, flexShrink: 0,
          }}>
            Respond
          </button>
        </div>
      )}

      {/* Posts */}
      <div>
        {!loadingPosts && filtered.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onRelate={handleRelate}
            onReply={handleReply}
            writesEnabled={!persistToSupabase || canWriteDb}
          />
        ))}
        {!loadingPosts && filtered.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-soft)' }}>
            <p style={{ fontSize: 15, marginBottom: 6 }}>No posts with this feeling yet.</p>
            <p style={{ fontSize: 13 }}>Be the first to share.</p>
          </div>
        )}
      </div>
    </div>
  );
}
