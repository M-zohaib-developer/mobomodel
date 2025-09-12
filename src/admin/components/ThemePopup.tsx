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

  // Built-in presets (five themes) with images. You can replace image URLs later.
  const presets: { name: string; payload: ThemePayload; imageUrl: string }[] = [
    {
      name: "Red",
      payload: {
        theme: "light",
        navbarBg: "#7f1d1d", // Deep red for strong header
        btnBg: "#dc2626", // Vivid red for CTA buttons
        cardBg: "#f3f4f6", // Light gray for clean card contrast
        bodyBg: "#e5e7eb", // Soft gray for subtle background
        textColor: "#111827", // Rich dark gray for high readability
        // backgroundImage: "https://source.unsplash.com/1200x800/?red+abstract",
      },
      imageUrl: "./src/public/image.png",
    },

    {
      name: "Green",
      payload: {
        theme: "light",
        navbarBg: "#065f46",
        btnBg: "#10b981",
        cardBg: "#ecfdf5",
        bodyBg: "#f0fdf4",
        textColor: "#064e3b",
        backgroundImage: "https://source.unsplash.com/1200x800/?green+tiger",
      },
      imageUrl: "https://source.unsplash.com/400x300/?green+tiger",
    },
    {
      name: "Purple",
      payload: {
        theme: "light",
        navbarBg: "#5b21b6",
        btnBg: "#7c3aed",
        cardBg: "#f5f3ff",
        bodyBg: "#faf5ff",
        textColor: "#1f1144",
        backgroundImage: "https://source.unsplash.com/1200x800/?purple",
      },
      imageUrl: "https://source.unsplash.com/400x300/?purple",
    },
    {
      name: "Orange",
      payload: {
        theme: "light",
        navbarBg: "#92400e",
        btnBg: "#fb923c",
        cardBg: "#fffbeb",
        bodyBg: "#fff7ed",
        textColor: "#3b2f1b",
        backgroundImage: "https://source.unsplash.com/1200x800/?orange",
      },
      imageUrl: "https://source.unsplash.com/400x300/?orange",
    },
    {
      name: "Teal",
      payload: {
        theme: "light",
        navbarBg: "#0f766e",
        btnBg: "#14b8a6",
        cardBg: "#ecfeff",
        bodyBg: "#f0fdfa",
        textColor: "#064e3b",
        backgroundImage: "https://source.unsplash.com/1200x800/?teal",
      },
      imageUrl: "https://source.unsplash.com/400x300/?teal",
    },
  ];

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // preview on mount or when any manual value changes
  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, navbarBg, btnBg, cardBg, bodyBg, textColor, backgroundImage]);

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

  const applyPreset = (preset: {
    name: string;
    payload: ThemePayload;
    imageUrl: string;
  }) => {
    const p = preset.payload;
    setTheme(p.theme || "light");
    setNavbarBg(p.navbarBg || "");
    setBtnBg(p.btnBg || "");
    setCardBg(p.cardBg || "");
    setBodyBg(p.bodyBg || "");
    setTextColor(p.textColor || "");
    setBackgroundImage(p.backgroundImage || "");
    setSelectedPreset(preset.name);
    if (setRoleTheme) setRoleTheme(role, p);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="absolute right-0 top-0 h-full theme-drawer overflow-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Switcher</h2>
          <button onClick={onClose} className="text-sm px-2 py-1">
            ✕
          </button>
        </div>

        {/* Preset theme buttons */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 text-sm">Theme Styles</div>
          <div className="flex space-x-2">
            {presets.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedPreset === p.name ? "ring-2 ring-offset-1" : "border"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

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

              {/* Preset preview image (show only if user clicked) */}
              <div className="col-span-2 mt-4">
                {selectedPreset && (
                  <div className="w-75 h-80 rounded border flex items-center justify-center bg-gray-100">
                    <img
                      src={
                        presets.find((p) => p.name === selectedPreset)
                          ?.imageUrl || ""
                      }
                      alt={`${selectedPreset} preview`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
              </div>
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
