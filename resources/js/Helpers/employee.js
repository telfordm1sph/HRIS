export const initials = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase() || "?";

export const AVATAR_PALETTES = [
    {
        bg: "bg-violet-100 dark:bg-violet-900/60",
        text: "text-violet-700 dark:text-violet-300",
    },
    {
        bg: "bg-sky-100 dark:bg-sky-900/60",
        text: "text-sky-700 dark:text-sky-300",
    },
    {
        bg: "bg-emerald-100 dark:bg-emerald-900/60",
        text: "text-emerald-700 dark:text-emerald-300",
    },
    {
        bg: "bg-rose-100 dark:bg-rose-900/60",
        text: "text-rose-700 dark:text-rose-300",
    },
    {
        bg: "bg-amber-100 dark:bg-amber-900/60",
        text: "text-amber-700 dark:text-amber-300",
    },
    {
        bg: "bg-cyan-100 dark:bg-cyan-900/60",
        text: "text-cyan-700 dark:text-cyan-300",
    },
];

export const avatarPalette = (id) =>
    AVATAR_PALETTES[Number(id) % AVATAR_PALETTES.length];
