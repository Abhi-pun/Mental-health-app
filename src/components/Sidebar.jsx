import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function ReachButton({ setReachCount }) {
  const [active, setActive] = useState(false);
  const [rippling, setRippling] = useState(false);
  const [notice, setNotice] = useState(null);
  const [noticeVisible, setNoticeVisible] = useState(false);

  const MESSAGES = [
    "Someone nearby just reached out.",
    "A new reach signal received.",
    "Someone is struggling quietly.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.45) {
        setNotice(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
        setNoticeVisible(true);
        setReachCount((c) => c + 1);
        setTimeout(() => setNoticeVisible(false), 4500);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleReach = () => {
    if (active) {
      setActive(false);
      return;
    }
    setRippling(true);
    setActive(true);
    setReachCount((c) => c + 1);
    setTimeout(() => setRippling(false), 700);
  };

  return (
    <div
      onClick={handleReach}
      style={{
        margin: "8px 12px 0",
        borderRadius: 18,
        border: active ? "1.5px solid #2e9e45" : "1.5px solid #4dbd66",
        background: active ? "#c8edcf" : "#dff5e4",
        padding: "16px 18px",
        cursor: "pointer",
        transition: "all 0.35s ease",
        boxShadow: active
          ? "0 0 0 5px rgba(46,158,69,0.15)"
          : "0 0 0 3px rgba(77,189,102,0.12)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Orb with breathing rings */}
        <div
          style={{
            position: "relative",
            width: 46,
            height: 46,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Ring 1 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "1.5px solid rgba(46,158,69,0.5)",
              animation: active ? "breathe 2.8s ease-in-out infinite" : "none",
            }}
          />
          {/* Ring 2 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "1.5px solid rgba(46,158,69,0.25)",
              animation: active
                ? "breathe2 2.8s ease-in-out infinite 0.5s"
                : "none",
            }}
          />
          {/* Ripple on click */}
          {rippling && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "rgba(46,158,69,0.28)",
                animation: "ripple 0.65s ease-out forwards",
              }}
            />
          )}
          {/* Orb */}
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: active ? "#2e9e45" : "#4dbd66",
              border: "1.5px solid transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.35s ease",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 13,
                height: 13,
                borderRadius: "50%",
                border: `2px solid rgba(255,255,255,0.85)`,
                transition: "border-color 0.35s ease",
                animation: active
                  ? "pulse-dot 2.5s ease-in-out infinite"
                  : "none",
              }}
            />
          </div>
        </div>

        <div>
          <p
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: active ? "#1e7a33" : "#1e6b30",
              margin: 0,
              transition: "color 0.3s",
            }}
          >
            {active ? "Circle notified" : "REACH"}
          </p>
          <p style={{ fontSize: 11.5, color: "#3a8a4e", marginTop: 2 }}>
            {active
              ? "You don't have to say anything."
              : "Signal quietly for support"}
          </p>
        </div>
      </div>

      {noticeVisible && (
        <div
          style={{
            marginTop: 11,
            paddingTop: 11,
            borderTop: "1px solid rgba(46,158,69,0.25)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11.5,
            color: "#1e7a33",
            animation: "fadeUp 0.4s ease",
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#4dbd66",
              flexShrink: 0,
              animation: "pulse-dot 1.8s ease-in-out infinite",
            }}
          />
          {notice}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  activePage,
  setActivePage,
  reachCount,
  setReachCount,
}) {
  const {
    isConfigured: authConfigured,
    loading: authLoading,
    error: authError,
    userId,
    userIdSuffix,
    signOut,
    clearError,
    loginUserId,
    isAnonymousUser,
  } = useAuth();

  const navItems = [
    { id: "feed", label: "Feed", dot: "#5C8C60" },
    { id: "myposts", label: "My posts", dot: "#9B8EC4" },
    { id: "wellbeing", label: "Wellbeing", dot: "#8AB88E" },
  ];

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: "var(--sidebar-w)",
        background: "var(--white)",
        borderRight: "1px solid var(--warm-mid)",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "22px 20px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--sage)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                border: "2.5px solid white",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "DM Serif Display, serif",
              fontSize: 18,
              color: "var(--ink)",
            }}
          >
            SafeCircle
          </span>
        </div>
        <p style={{ fontSize: 11, color: "var(--ink-soft)", paddingLeft: 37 }}>
          anonymous • safe • real
        </p>
      </div>

      {/* Reach Button — right under the logo */}
      <div style={{ paddingBottom: 8 }}>
        {reachCount > 0 && (
          <p
            style={{
              fontSize: 11,
              color: "var(--ink-soft)",
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            {reachCount} in the circle right now
          </p>
        )}
        <ReachButton reachCount={reachCount} setReachCount={setReachCount} />
      </div>

      {/* Nav */}
      <nav style={{ padding: "4px 12px", flex: 1 }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              background:
                activePage === item.id ? "var(--sage-pale)" : "transparent",
              color: activePage === item.id ? "var(--sage)" : "var(--ink-mid)",
              fontSize: 14,
              fontWeight: activePage === item.id ? 500 : 400,
              marginBottom: 2,
              transition: "var(--transition)",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  activePage === item.id ? item.dot : "var(--warm-mid)",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            />
            {item.label}
          </button>
        ))}
      </nav>

      {authConfigured && (
        <div
          style={{
            margin: "0 12px 12px",
            padding: "12px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--warm)",
            border: "1px solid var(--warm-mid)",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--ink)",
              marginBottom: 4,
            }}
          >
            Your account
          </p>
          {authLoading && (
            <p
              style={{
                fontSize: 11,
                color: "var(--ink-soft)",
                lineHeight: 1.45,
              }}
            >
              Loading…
            </p>
          )}
          {!authLoading && authError && (
            <>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--clay)",
                  lineHeight: 1.45,
                  marginBottom: 8,
                }}
              >
                {authError}
              </p>
              <button
                type="button"
                onClick={() => clearError()}
                style={{
                  padding: "6px 12px",
                  borderRadius: 50,
                  background: "var(--sage)",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Dismiss
              </button>
            </>
          )}
          {!authLoading && userId && (
            <>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--ink-soft)",
                  lineHeight: 1.5,
                }}
              >
                {loginUserId ? (
                  <>
                    Signed in as{" "}
                    <strong style={{ color: "var(--ink-mid)" }}>
                      {loginUserId}
                    </strong>
                    <span style={{ display: "block", marginTop: 6 }}>
                      You can log out and sign back in anytime; your posts stay
                      tied to this account.
                    </span>
                  </>
                ) : !isAnonymousUser ? (
                  <>
                    Signed in with your account.
                    {userIdSuffix && (
                      <span
                        style={{
                          display: "block",
                          marginTop: 6,
                          fontFamily: "monospace",
                          color: "var(--ink-mid)",
                        }}
                      >
                        Ref ·•••{userIdSuffix}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    Anonymous session.
                    {userIdSuffix && (
                      <span
                        style={{
                          display: "block",
                          marginTop: 6,
                          fontFamily: "monospace",
                          color: "var(--ink-mid)",
                        }}
                      >
                        Session ·•••{userIdSuffix}
                      </span>
                    )}
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={() => signOut()}
                style={{
                  marginTop: 10,
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 50,
                  background: "white",
                  border: "1px solid var(--warm-mid)",
                  color: "var(--ink-mid)",
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
