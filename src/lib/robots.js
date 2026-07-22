const cache = new Map();

function parseRobots(text, userAgent) {
  const groups = [];
  let current = { agents: [], rules: [] };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, '').trim();
    if (!line) continue;
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === 'user-agent') {
      if (current.agents.length && current.rules.length) {
        groups.push(current);
        current = { agents: [], rules: [] };
      }
      current.agents.push(value.toLowerCase());
    } else if ((field === 'allow' || field === 'disallow') && current.agents.length) {
      current.rules.push({ field, path: value });
    }
  }
  if (current.agents.length) groups.push(current);

  const botName = userAgent.split('/')[0].toLowerCase();
  const selected = groups.filter((group) => group.agents.includes(botName));
  const applicable = selected.length ? selected : groups.filter((group) => group.agents.includes('*'));
  return applicable.flatMap((group) => group.rules);
}

export async function isAllowedByRobots(url, { fetchImpl, userAgent }) {
  const target = new URL(url);
  const robotsUrl = `${target.origin}/robots.txt`;
  let rules = cache.get(robotsUrl);

  if (!rules) {
    const response = await fetchImpl(robotsUrl, { headers: { 'User-Agent': userAgent } });
    // A missing robots file is not a prohibition; inaccessible robots is skipped safely.
    if (response.status === 404) return { allowed: true, reason: 'robots.txt missing' };
    if (!response.ok) return { allowed: false, reason: `robots.txt returned ${response.status}` };
    rules = parseRobots(await response.text(), userAgent);
    cache.set(robotsUrl, rules);
  }

  const matches = rules
    .filter((rule) => rule.path && target.pathname.startsWith(rule.path))
    .sort((a, b) => b.path.length - a.path.length);
  const rule = matches[0];
  return rule?.field === 'disallow'
    ? { allowed: false, reason: `disallowed by ${robotsUrl}` }
    : { allowed: true, reason: 'allowed by robots.txt' };
}

