import { useState, useEffect, useCallback, useMemo } from "react";
import { Flag, Heart, MessageCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { mapRowToPost } from "../lib/feedPosts";
import { useAuth } from "../context/AuthContext";

const TAGS = [
  { id: "all", label: "All" },
  { id: "family", label: "Family Pressure" },
  { id: "study_abroad", label: "Studying Abroad" },
  { id: "marriage", label: "Marriage" },
  { id: "financial", label: "Financial Stress" },
  { id: "loneliness", label: "Loneliness" },
  { id: "hope", label: "Hope" },
  { id: "burnout", label: "Burned out" },
  { id: "lost", label: "Feeling lost" },
  { id: "overwhelmed", label: "Overwhelmed" },
  { id: "miscellaneous", label: "Miscellaneous" },
];

const TAG_COLORS = {
  lost: { bg: "#EEEAF8", text: "#9B8EC4", border: "#C8BEE8" },
  overwhelmed: { bg: "#FDF0E8", text: "#C4856A", border: "#EAC4B3" },
  family: { bg: "#EBF2EC", text: "#5C8C60", border: "#A8C5AC" },
  burnout: { bg: "#FEF3E8", text: "#E8A87C", border: "#F0D0A8" },
  hope: { bg: "#E8F4F8", text: "#5B8FA8", border: "#A8D0E0" },
  lonely: { bg: "#F2EBF2", text: "#A87CA8", border: "#D0A8D0" },
  marriage: { bg: "#F8EBEE", text: "#A86B78", border: "#E8C4CC" },
  study_abroad: { bg: "#E8EEF8", text: "#5B6FA8", border: "#B8C4E8" },
  financial: { bg: "#F5F0E8", text: "#8B7355", border: "#D8C8A8" },
  academic: { bg: "#ECEAF8", text: "#6B5BA8", border: "#C4BEE8" },
  loneliness: { bg: "#EDE8F2", text: "#7A6B8C", border: "#C8BED8" },
  miscellaneous: { bg: "#F0F0F0", text: "#6B6B6B", border: "#D8D8D8" },
};

// Gentle, anonymous nicknames for mental health forum
const GENTLE_NICKNAMES = [
  "Quiet Oak",
  "Gentle Stream",
  "Morning Dove",
  "Soft Rain",
  "Peaceful Soul",
  "Quiet Listener",
  "Kind Heart",
  "Gentle Spirit",
  "Calm Waters",
  "Silent Strength",
  "Soft Whisper",
  "Brave Bloom",
  "Tender Heart",
  "Quiet Courage",
  "Gentle Dawn",
  "Peaceful Mind",
  "Kindred Spirit",
  "Soft Light",
  "Quiet Warrior",
  "Gentle Soul",
  "Moonbeam",
  "Wildflower",
  "Sunrise",
  "Willow Tree",
  "Butterfly",
  "Starlight",
  "River Stone",
  "Cloud Drifter",
  "Ocean Wave",
  "Meadow Song",
  "Caring Heart",
  "Warm Embrace",
  "Quiet Hope",
  "Gentle Voice",
  "Peaceful Journey",
];

// Map to store nicknames per user/post for consistency
const nicknameMap = new Map();

// Function to get or generate a consistent nickname for a post
const getNicknameForPost = (postId) => {
  if (nicknameMap.has(postId)) {
    return nicknameMap.get(postId);
  }
  const randomNickname =
    GENTLE_NICKNAMES[Math.floor(Math.random() * GENTLE_NICKNAMES.length)];
  nicknameMap.set(postId, randomNickname);
  return randomNickname;
};

// Get initials from nickname (first letters of each word)
const getInitialsFromNickname = (nickname) => {
  return nickname
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Get color based on nickname (consistent but gentle colors)
const getColorForNickname = (nickname) => {
  const colors = [
    "#9B8EC4",
    "#C4856A",
    "#5C8C60",
    "#E8A87C",
    "#5B8FA8",
    "#A87CA8",
    "#A86B78",
    "#5B6FA8",
    "#8B7355",
    "#6B5BA8",
  ];
  const index =
    nickname.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
};

function TagPill({ tag, small }) {
  const c = TAG_COLORS[tag] || {
    bg: "#F0F0F0",
    text: "#8A8A8A",
    border: "#D0D0D0",
  };
  const label = TAGS.find((t) => t.id === tag)?.label || tag;
  return (
    <span
      style={{
        fontSize: small ? 10 : 11,
        fontWeight: 500,
        padding: small ? "2px 8px" : "3px 10px",
        borderRadius: 50,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function PostCard({ post, onRelate, onReply, writesEnabled }) {
  const [related, setRelated] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [reported, setReported] = useState(false);

  // Get consistent nickname for this post
  const nickname = useMemo(() => getNicknameForPost(post.id), [post.id]);
  const initials = useMemo(() => getInitialsFromNickname(nickname), [nickname]);
  const avatarColor = useMemo(() => getColorForNickname(nickname), [nickname]);

  const handleRelateClick = () => {
    if (related || !writesEnabled) return;
    setRelated(true);
    onRelate(post.id);
  };

  const handleReplySend = async () => {
    if (!replyText.trim() || !writesEnabled) return;
    const t = replyText.trim();
    setReplyText("");
    await onReply(post.id, t);
  };

  return (
    <article
      style={{
        padding: "20px 24px",
        borderBottom: "1px solid var(--warm-mid)",
        animation: "fadeUp 0.35s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: avatarColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              color: "white",
              letterSpacing: "0.02em",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {initials}
          </div>
          <div>
            <span
              style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}
            >
              {nickname}
            </span>
            <span
              style={{ fontSize: 12, color: "var(--ink-soft)", marginLeft: 6 }}
            >
              · {post.time}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TagPill tag={post.tag} />
          <button
            onClick={() => setReported(true)}
            style={{
              background: "none",
              padding: 4,
              color: reported ? "var(--clay)" : "var(--ink-soft)",
              opacity: 0.5,
              transition: "color 0.2s, opacity 0.2s",
            }}
          >
            <Flag size={12} />
          </button>
        </div>
      </div>

      {/* Text */}
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: "var(--ink)",
          marginBottom: 14,
        }}
      >
        {post.text}
      </p>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <button
          onClick={handleRelateClick}
          disabled={!writesEnabled}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "none",
            fontSize: 12,
            color: related ? "var(--sage)" : "var(--ink-soft)",
            fontWeight: related ? 500 : 400,
            transition: "color 0.2s",
            opacity: writesEnabled ? 1 : 0.45,
            cursor: writesEnabled ? "pointer" : "not-allowed",
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: related ? "var(--sage)" : "var(--warm-dark)",
              transition: "background 0.2s",
            }}
          />
          {post.relates}{" "}
          {post.relates === 1 ? "person relates" : "people relate"}
        </button>
        <button
          onClick={() => setShowReplies((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "none",
            fontSize: 12,
            color: "var(--ink-soft)",
          }}
        >
          <MessageCircle size={13} />
          Reply
        </button>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "none",
            fontSize: 12,
            color: "var(--ink-soft)",
          }}
        >
          <Heart size={13} />
          Share experience
        </button>
      </div>

      {/* Replies */}
      {showReplies && (
        <div style={{ marginTop: 16 }}>
          {post.replies.map((r) => {
            // Generate consistent nickname for each reply based on its ID
            const replyNickname = r.name || getNicknameForPost(`reply_${r.id}`);
            const replyInitials = getInitialsFromNickname(replyNickname);
            const replyColor = getColorForNickname(replyNickname);

            return (
              <div
                key={r.id}
                style={{
                  padding: "12px 14px",
                  marginBottom: 8,
                  background: "var(--warm)",
                  borderRadius: "var(--radius-md)",
                  borderLeft: `3px solid ${replyColor}`,
                  animation: "fadeUp 0.3s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: replyColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 600,
                      color: "white",
                    }}
                  >
                    {replyInitials}
                  </div>
                  <span
                    style={{ fontSize: 11, color: replyColor, fontWeight: 600 }}
                  >
                    {replyNickname}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--ink-mid)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {r.text}
                </p>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReplySend()}
              placeholder="Reply anonymously…"
              style={{
                flex: 1,
                padding: "9px 14px",
                background: "var(--warm)",
                border: "1px solid var(--warm-mid)",
                borderRadius: 50,
                fontSize: 13,
                color: "var(--ink)",
              }}
            />
            <button
              onClick={handleReplySend}
              disabled={!writesEnabled}
              style={{
                padding: "9px 18px",
                borderRadius: 50,
                background:
                  replyText.trim() && writesEnabled
                    ? "var(--sage)"
                    : "var(--warm-mid)",
                color: "white",
                fontSize: 13,
                fontWeight: 500,
                transition: "background 0.2s",
                opacity: writesEnabled ? 1 : 0.6,
                cursor: writesEnabled ? "pointer" : "not-allowed",
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
  const [activeTag, setActiveTag] = useState("all");
  const [posts, setPosts] = useState(() =>
    isSupabaseConfigured ? [] : SEED_POSTS,
  );
  const [loadingPosts, setLoadingPosts] = useState(isSupabaseConfigured);
  const [dbError, setDbError] = useState(null);
  const [persistToSupabase, setPersistToSupabase] = useState(false);
  const [composing, setComposing] = useState(false);
  const [newText, setNewText] = useState("");
  const [newTag, setNewTag] = useState("overwhelmed");
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
          .from("posts")
          .select(
            "id, created_at, tag, body, relates_count, replies ( id, body, display_name, created_at )",
          )
          .order("created_at", { ascending: false });
        if (cancelled) return;
        if (error) throw error;
        setPosts((data || []).map(mapRowToPost));
        setPersistToSupabase(true);
        setDbError(null);
      } catch (e) {
        if (!cancelled) {
          setDbError(e.message || "Could not load posts from Supabase.");
          setPosts(SEED_POSTS);
          setPersistToSupabase(false);
        }
      } finally {
        if (!cancelled) setLoadingPosts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRelate = useCallback(
    (postId) => {
      if (persistToSupabase && supabase && userId) {
        supabase
          .rpc("increment_post_relates", { target_id: postId })
          .then(({ error }) => {
            if (error) console.error(error);
          });
      }
      setPosts((ps) =>
        ps.map((p) => (p.id === postId ? { ...p, relates: p.relates + 1 } : p)),
      );
    },
    [persistToSupabase, userId],
  );

  const handleReply = useCallback(
    async (postId, text) => {
      if (persistToSupabase && supabase) {
        if (!userId) return;
        const { data, error } = await supabase
          .from("replies")
          .insert({ post_id: postId, body: text, user_id: userId })
          .select("id, body, display_name")
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
                    {
                      id: data.id,
                      text: data.body,
                      name:
                        data.display_name ||
                        getNicknameForPost(`reply_${data.id}`),
                    },
                  ],
                }
              : p,
          ),
        );
        return;
      }
      // For seed posts, generate a random nickname for the reply
      const randomNickname =
        GENTLE_NICKNAMES[Math.floor(Math.random() * GENTLE_NICKNAMES.length)];
      setPosts((ps) =>
        ps.map((p) =>
          p.id === postId
            ? {
                ...p,
                replies: [
                  ...p.replies,
                  {
                    id: Date.now(),
                    text,
                    name: randomNickname,
                  },
                ],
              }
            : p,
        ),
      );
    },
    [persistToSupabase, userId],
  );

  const handlePost = async () => {
    if (!newText.trim()) return;
    const body = newText.trim();
    if (persistToSupabase && supabase) {
      if (!userId) return;
      const { data, error } = await supabase
        .from("posts")
        .insert({ tag: newTag, body, user_id: userId })
        .select("id, created_at, tag, body, relates_count")
        .single();
      if (error) {
        console.error(error);
        return;
      }
      setPosts((p) => [mapRowToPost({ ...data, replies: [] }), ...p]);
    } else {
      // Generate a random nickname for the new post
      const randomNickname =
        GENTLE_NICKNAMES[Math.floor(Math.random() * GENTLE_NICKNAMES.length)];
      // Store the nickname in the map
      nicknameMap.set(Date.now(), randomNickname);

      setPosts((p) => [
        {
          id: Date.now(),
          tag: newTag,
          time: "just now",
          relates: 0,
          text: body,
          replies: [],
          nickname: randomNickname,
        },
        ...p,
      ]);
    }
    setNewText("");
    setComposing(false);
  };

  const filtered =
    activeTag === "all" ? posts : posts.filter((p) => p.tag === activeTag);

  return (
    <div>
      {/* Top bar */}
      <div
        style={{
          padding: "20px 24px 0",
          borderBottom: "1px solid var(--warm-mid)",
          position: "sticky",
          top: 0,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <div>
            <h2 style={{ fontSize: 22, color: "var(--ink)", marginBottom: 2 }}>
              Community feed
            </h2>
            <p style={{ fontSize: 12, color: "var(--ink-soft)" }}>
              anonymous • safe • real • gentle nicknames
              {persistToSupabase && (
                <span style={{ marginLeft: 8, color: "var(--sage)" }}>
                  · saved
                </span>
              )}
              {persistToSupabase && authConfigured && userId && (
                <span style={{ marginLeft: 8, color: "var(--ink-mid)" }}>
                  · {!isAnonymousUser ? "account" : "private session"}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setComposing((v) => !v)}
            style={{
              padding: "9px 20px",
              borderRadius: 50,
              background: "var(--sage)",
              color: "white",
              fontSize: 13,
              fontWeight: 500,
              boxShadow: "0 2px 12px rgba(92,140,96,0.3)",
              transition: "opacity 0.2s",
            }}
          >
            + Post
          </button>
        </div>

        {/* Tag filters */}
        <div
          style={{
            display: "flex",
            gap: 7,
            overflowX: "auto",
            paddingBottom: 14,
            scrollbarWidth: "none",
          }}
        >
          {TAGS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTag(t.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 50,
                whiteSpace: "nowrap",
                fontSize: 12,
                fontWeight: activeTag === t.id ? 500 : 400,
                background: activeTag === t.id ? "var(--sage)" : "var(--warm)",
                color: activeTag === t.id ? "white" : "var(--ink-mid)",
                border: `1px solid ${activeTag === t.id ? "transparent" : "var(--warm-mid)"}`,
                transition: "var(--transition)",
                flexShrink: 0,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compose */}
      {composing && (
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--warm-mid)",
            background: "var(--sage-pale)",
            animation: "fadeUp 0.3s ease",
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: "var(--ink-soft)",
              marginBottom: 10,
              fontStyle: "italic",
            }}
          >
            You're posting anonymously. You'll receive a gentle, unique
            nickname.
          </p>
          <textarea
            autoFocus
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Share how you're feeling anonymously…"
            rows={3}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "white",
              border: "1px solid var(--sage-mid)",
              borderRadius: "var(--radius-md)",
              fontSize: 14,
              color: "var(--ink)",
              resize: "none",
              lineHeight: 1.6,
            }}
          />
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
              alignItems: "center",
            }}
          >
            <select
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              style={{
                padding: "7px 12px",
                borderRadius: 50,
                border: "1px solid var(--warm-mid)",
                background: "white",
                fontSize: 12,
                color: "var(--ink-mid)",
              }}
            >
              {TAGS.filter((t) => t.id !== "all").map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button
                onClick={() => setComposing(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 50,
                  background: "white",
                  border: "1px solid var(--warm-mid)",
                  fontSize: 12,
                  color: "var(--ink-soft)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={persistToSupabase && !canWriteDb}
                style={{
                  padding: "8px 20px",
                  borderRadius: 50,
                  background:
                    newText.trim() && (!persistToSupabase || canWriteDb)
                      ? "var(--sage)"
                      : "var(--warm-mid)",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 500,
                  transition: "background 0.2s",
                  opacity: persistToSupabase && !canWriteDb ? 0.7 : 1,
                  cursor:
                    persistToSupabase && !canWriteDb
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {dbError && (
        <div
          style={{
            margin: "12px 24px 0",
            padding: "10px 14px",
            background: "#FDF6F0",
            borderRadius: "var(--radius-md)",
            border: "1px solid #E8C4B3",
            fontSize: 13,
            color: "var(--ink-mid)",
          }}
        >
          {dbError} Showing sample posts offline.
        </div>
      )}

      {loadingPosts && (
        <div
          style={{
            padding: "32px 24px",
            textAlign: "center",
            color: "var(--ink-soft)",
            fontSize: 14,
          }}
        >
          Loading posts…
        </div>
      )}

      {/* Reach banner */}
      {!loadingPosts && reachBanner && (
        <div
          style={{
            margin: "16px 24px",
            padding: "14px 16px",
            background: "var(--sage-pale)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--sage-mid)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            animation: "fadeUp 0.4s ease",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "var(--sage)",
              flexShrink: 0,
              animation: "breathe 2s ease-in-out infinite",
            }}
          />
          <p
            style={{
              fontSize: 13,
              color: "var(--ink-mid)",
              flex: 1,
              lineHeight: 1.5,
            }}
          >
            Someone in your community just reached out. They need support right
            now.
          </p>
          <button
            style={{
              padding: "6px 14px",
              borderRadius: 50,
              background: "var(--sage)",
              color: "white",
              fontSize: 12,
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            Respond
          </button>
        </div>
      )}

      {/* Posts */}
      <div>
        {!loadingPosts &&
          filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onRelate={handleRelate}
              onReply={handleReply}
              writesEnabled={!persistToSupabase || canWriteDb}
            />
          ))}
        {!loadingPosts && filtered.length === 0 && (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              color: "var(--ink-soft)",
            }}
          >
            <p style={{ fontSize: 15, marginBottom: 6 }}>
              No posts with this feeling yet.
            </p>
            <p style={{ fontSize: 13 }}>Be the first to share.</p>
          </div>
        )}
      </div>
    </div>
  );
}
