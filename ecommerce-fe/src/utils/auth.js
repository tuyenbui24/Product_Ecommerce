function toRoleString(r) {
  if (!r) return "";
  if (typeof r === "string") {
    const up = r.toUpperCase();
    return up.startsWith("ROLE_") ? up : `ROLE_${up}`;
  }
  const cand = r.authority || r.name || r.role || r.roleName || "";
  return toRoleString(String(cand));
}

export function hasAnyRole(userRoles, required = []) {
  const userSet = new Set((userRoles || []).map(toRoleString));
  return required.some((rr) => userSet.has(toRoleString(rr)));
}

export function hasNoneOf(userRoles, blocked = []) {
  const userSet = new Set((userRoles || []).map(toRoleString));
  return blocked.every((rr) => !userSet.has(toRoleString(rr)));
}
