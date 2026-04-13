import {
  addGuestbookMessage,
  getGuestbookMessages,
  type GuestbookDatabase,
} from "./actions";
import ClientReadMetric from "./client-read-metric";

type HomeProps = {
  searchParams?: Promise<{
    db?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const selectedDb: GuestbookDatabase = params?.db === "firebase" ? "firebase" : "upstash";
  const { messages, readMs, database } = await getGuestbookMessages(selectedDb);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-black/50">
        <h1 className="text-2xl font-semibold">Global Guestbook</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Leave a short message and see what others have shared.
        </p>
        <form method="get" className="mt-4 flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="db" value="upstash" defaultChecked={selectedDb === "upstash"} />
            Upstash Redis (global)
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="db"
              value="firebase"
              defaultChecked={selectedDb === "firebase"}
            />
            Firebase RTDB (single region)
          </label>
          <button
            type="submit"
            className="rounded-md border border-black/20 px-3 py-1 text-xs font-medium hover:bg-black/5 dark:border-white/25 dark:hover:bg-white/10 cursor-pointer"
          >
            Switch
          </button>
        </form>
        <form action={addGuestbookMessage} className="mt-6 space-y-4">
          <input type="hidden" name="database" value={selectedDb} />
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              maxLength={40}
              required
              placeholder="Your name"
              className="w-full rounded-lg border border-black/15 bg-transparent px-3 py-2 text-sm outline-none ring-0 placeholder:text-zinc-500 focus:border-black/40 dark:border-white/20 dark:focus:border-white/40"
            />
          </div>
          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              maxLength={280}
              required
              placeholder="Write something nice..."
              rows={4}
              className="w-full rounded-lg border border-black/15 bg-transparent px-3 py-2 text-sm outline-none ring-0 placeholder:text-zinc-500 focus:border-black/40 dark:border-white/20 dark:focus:border-white/40"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Send message
          </button>
        </form>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Message History</h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Server read time ({database}): <span className="font-semibold">{readMs} ms</span>
          </p>
        </div>
        <ClientReadMetric database={selectedDb} />
        {messages.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            No messages yet. Be the first to post.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {messages.map((entry) => (
              <li
                key={entry.id}
                className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-black/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{entry.name}</p>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {entry.database}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      write: {entry.writeMs.toFixed(2)} ms
                    </p>
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm">{entry.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
