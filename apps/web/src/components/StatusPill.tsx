type Tone = 'blue' | 'green' | 'yellow' | 'red' | 'gray'

export function StatusPill({ tone, children }: { tone: Tone; children: string }) {
  return <span className={`status ${tone}`}>{children}</span>
}

