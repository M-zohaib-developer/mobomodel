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
        navbarBg: "#f30b0bff", // Deep red for strong header
        btnBg: "#eb0606ff", // Vivid red for CTA buttons
        cardBg: "#f50e19ff", // Light gray for clean card contrast
        bodyBg: "#e5e7eb", // Soft gray for subtle background
        textColor: "#000000ff", // Rich dark gray for high readability
        // backgroundImage: "https://source.unsplash.com/1200x800/?red+abstract",
      },
      imageUrl: "./src/public/imager.png",
    },

    {
      name: "Green",
      payload: {
        theme: "light",
        navbarBg: "#08f1afff",
        btnBg: "#0ceca2ff",
        cardBg: "#0bf186ff",
        bodyBg: "#f0fdf4",
        textColor: "#000000ff",
        backgroundImage: "https://source.unsplash.com/1200x800/?green+tiger",
      },
      imageUrl: "./src/public/imageg.png",
    },
    {
      name: "Purple",
      payload: {
        theme: "light",
        navbarBg: "#630eecff",
        btnBg: "#7c3aed",
        cardBg: "#340ef3ff",
        bodyBg: "#faf5ff",
        textColor: "#000000ff",
        backgroundImage: "https://source.unsplash.com/1200x800/?purple",
      },
      imageUrl: "./src/public/imagep.png",
    },
    {
      name: "Orange",
      payload: {
        theme: "light",
        navbarBg: "#ec6510ff",
        btnBg: "#fb923c",
        cardBg: "#fb923c",
        bodyBg: "#fff7ed",
        textColor: "#000000ff",
        backgroundImage: "https://source.unsplash.com/1200x800/?orange",
      },
      imageUrl: "./src/public/imageo.png",
    },
    {
      name: "Teal",
      payload: {
        theme: "light",
        navbarBg: "#14b8a6",
        btnBg: "#14b8a6",
        cardBg: "#14b8a6",
        bodyBg: "#f0fdfa",
        textColor: "#064e3b",
        backgroundImage: "https://source.unsplash.com/1200x800/?teal",
      },
      imageUrl: "./src/public/imaget.png",
    },
  ];

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  // default to true so admin's changes affect all roles unless they opt out
  const [applyToAll, setApplyToAll] = useState<boolean>(true);

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
    if (setRoleTheme) {
      if (applyToAll) {
        // persist/apply for every role so admin changes affect whole site
        ["admin", "client", "enterprise"].forEach((r) =>
          setRoleTheme(r, payload)
        );
      } else {
        setRoleTheme(role, payload);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    theme,
    navbarBg,
    btnBg,
    cardBg,
    bodyBg,
    textColor,
    backgroundImage,
    applyToAll,
  ]);

  const handleSave = () => {
    const payload: ThemePayload = {
      theme,
      navbarBg: navbarBg || undefined,
      btnBg: btnBg || undefined,
      cardBg: cardBg || undefined,
      bodyBg: bodyBg || undefined,
      textColor: textColor || undefined,
      backgroundImage: backgroundImage || undefined,
    };
    if (setRoleTheme) {
      if (applyToAll) {
        ["admin", "client", "enterprise"].forEach((r) =>
          setRoleTheme(r, payload)
        );
      } else {
        setRoleTheme(role, payload);
      }
    }
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
          <div className="flex space-x-2 items-center">
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

            <label className="flex items-center text-xs ml-3">
              <input
                type="checkbox"
                className="mr-2"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
              />
              Apply to all roles
            </label>
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
    <div className="w-[300px] h-[300px] rounded border overflow-hidden bg-gray-100">
      <img
        src={
          presets.find((p) => p.name === selectedPreset)?.imageUrl || ""
        }
        alt={`${selectedPreset} preview`}
        className="w-full h-full object-contain"
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
