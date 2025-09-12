import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";

interface ThemePayload {
  theme: "light" | "dark";
  navbarBg?: string;
  btnBg?: string;
  cardBg?: string;
  bodyBg?: string;
  textColor?: string;
  backgroundImage?: string;
}

export function ThemePopup({ onClose }: { onClose: () => void }) {
  const { state, setRoleTheme } = useApp();
  const role = "admin";
  const existing = (state.roleThemes && state.roleThemes[role]) || {};

  const [theme, setTheme] = useState<"light" | "dark">(
    existing.theme || "light"
  );
  const [navbarBg, setNavbarBg] = useState(existing.navbarBg || "");
  const [btnBg, setBtnBg] = useState(existing.btnBg || "");
  const [cardBg, setCardBg] = useState(existing.cardBg || "");
  const [bodyBg, setBodyBg] = useState(existing.bodyBg || "");
  const [textColor, setTextColor] = useState(existing.textColor || "");
  const [backgroundImage, setBackgroundImage] = useState(
    existing.backgroundImage || ""
  );

  useEffect(() => {
    // preview on mount
    if (setRoleTheme)
      setRoleTheme(role, {
        theme,
        navbarBg,
        btnBg,
        cardBg,
        bodyBg,
        textColor,
        backgroundImage,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    const payload: ThemePayload = {
      theme,
      navbarBg,
      btnBg,
      cardBg,
      bodyBg,
      textColor,
      backgroundImage,
    };
    if (setRoleTheme) setRoleTheme(role, payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl p-6 rounded-lg bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4">Admin Theme Popup</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Mode</label>
            <div className="flex space-x-2 my-2">
              <button
                onClick={() => setTheme("light")}
                className={`px-3 py-1 rounded ${
                  theme === "light" ? "bg-gray-200" : "border"
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`px-3 py-1 rounded ${
                  theme === "dark" ? "bg-gray-800 text-white" : "border"
                }`}
              >
                Dark
              </button>
            </div>

            <label className="block text-sm font-medium mt-3">
              Navbar Color
            </label>
            <input
              type="color"
              value={navbarBg}
              onChange={(e) => {
                setNavbarBg(e.target.value);
              }}
              className="w-20 h-10"
            />

            <label className="block text-sm font-medium mt-3">
              Button Color
            </label>
            <input
              type="color"
              value={btnBg}
              onChange={(e) => {
                setBtnBg(e.target.value);
              }}
              className="w-20 h-10"
            />

            <label className="block text-sm font-medium mt-3">Card Color</label>
            <input
              type="color"
              value={cardBg}
              onChange={(e) => {
                setCardBg(e.target.value);
              }}
              className="w-20 h-10"
            />

            <label className="block text-sm font-medium mt-3">Body Color</label>
            <input
              type="color"
              value={bodyBg}
              onChange={(e) => {
                setBodyBg(e.target.value);
              }}
              className="w-20 h-10"
            />

            <label className="block text-sm font-medium mt-3">Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value);
              }}
              className="w-20 h-10"
            />

            <label className="block text-sm font-medium mt-3">
              Background Image URL
            </label>
            <input
              type="text"
              value={backgroundImage}
              onChange={(e) => setBackgroundImage(e.target.value)}
              placeholder="https://...jpg"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Preview</label>
            <div
              className="p-4 rounded mt-2"
              style={{
                background: cardBg || "var(--app-card-bg)",
                color: textColor || "var(--app-text-color)",
              }}
            >
              <div
                className="p-3 rounded mb-4"
                style={{
                  background: navbarBg || "var(--app-navbar-bg)",
                  color: textColor || "var(--app-text-color)",
                }}
              >
                Navbar preview
              </div>

              <div className="mb-3">
                <button
                  className="px-4 py-2 rounded text-white"
                  style={{ background: btnBg || "var(--app-btn-bg)" }}
                >
                  Primary Button
                </button>
              </div>

              <div
                className="p-3 rounded"
                style={{ background: cardBg || "var(--app-card-bg)" }}
              >
                <div className="font-medium">Card title</div>
                <div className="text-sm">Card body text preview.</div>
              </div>

              <div
                className="mt-3 h-40 rounded bg-cover bg-center"
                style={{
                  backgroundImage: backgroundImage
                    ? `url(${backgroundImage})`
                    : "none",
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={() => {
              if (setRoleTheme)
                setRoleTheme(role, {
                  theme,
                  navbarBg,
                  btnBg,
                  cardBg,
                  bodyBg,
                  textColor,
                  backgroundImage,
                });
            }}
            className="px-4 py-2 border rounded"
          >
            Preview
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ThemePopup;
