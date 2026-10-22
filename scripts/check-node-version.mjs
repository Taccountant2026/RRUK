// A vulnerable installed Node.js binary cannot be patched by changing application source.
// Fail closed if this process is not running a vendor-fixed, supported major version.
const fixedMinimums = new Map([[22, [23, 4]], [24, [22, 1]], [26, [12, 1]]]);
const raw = process.versions.node;
const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(raw);
const [major, minor, patch] = match ? match.slice(1).map(Number) : [0, 0, 0];
const minimum = fixedMinimums.get(major);
const patched = minimum && (minor > minimum[0] || minor === minimum[0] && patch >= minimum[1]);
if (!patched) {
  console.error(`Unsupported or potentially vulnerable Node.js v${raw}. Use an officially patched release: 22.23.4+, 24.22.1+ or 26.12.1+ within its supported major version. See https://nodejs.org/en/blog/vulnerability/october-2026-security-releases`);
  process.exit(1);
}
