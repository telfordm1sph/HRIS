export default function ErrorTable({ errors }) {
    if (!errors?.length) return null;
    return (
        <div className="mt-4">
            <p className="text-[12px] font-semibold text-red-600 dark:text-red-400 mb-2">
                {errors.length} error{errors.length !== 1 ? "s" : ""} found
            </p>
            <div className="rounded-lg border border-red-200 dark:border-red-900 overflow-hidden">
                <table className="w-full text-[12px]">
                    <thead>
                        <tr className="bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900">
                            {["Sheet", "Row", "Field", "Issue"].map((h) => (
                                <th
                                    key={h}
                                    className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-red-700 dark:text-red-400 font-mono"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-red-100 dark:divide-red-900/40">
                        {errors.map((e, i) => (
                            <tr
                                key={i}
                                className="bg-background hover:bg-red-50/50 dark:hover:bg-red-950/20"
                            >
                                <td className="px-3 py-2 font-mono text-muted-foreground">
                                    {e.sheet}
                                </td>
                                <td className="px-3 py-2 font-mono text-muted-foreground">
                                    {e.row}
                                </td>
                                <td className="px-3 py-2 text-foreground/70">
                                    {e.field}
                                </td>
                                <td className="px-3 py-2 text-red-700 dark:text-red-400">
                                    {e.message}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
