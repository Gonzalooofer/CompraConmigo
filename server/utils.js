export function toUser(doc) {
  return {
    id: doc._id,
    name: doc.name,
    avatar: doc.avatar,
    color: doc.color,
    email: doc.email || undefined,
    phoneNumber: doc.phoneNumber || undefined,
    plan: doc.plan,
    notificationsEnabled: doc.notificationsEnabled,
    language: doc.language,
    theme: doc.theme
  };
}

export function toGroup(doc) {
  return {
    id: doc._id,
    name: doc.name,
    members: doc.members,
    admins: doc.admins,
    icon: doc.icon,
    color: doc.color
  };
}

export function toItem(doc) {
  return {
    id: doc._id,
    name: doc.name,
    category: doc.category,
    quantity: doc.quantity,
    estimatedPrice: doc.estimatedPrice,
    checked: doc.checked,
    assignedTo: doc.assignedTo,
    groupId: doc.groupId,
    storePrices: doc.storePrices
  };
}

export function toSettlement(doc) {
  return {
    id: doc._id,
    fromUserId: doc.fromUserId,
    toUserId: doc.toUserId,
    amount: doc.amount,
    timestamp: doc.timestamp,
    groupId: doc.groupId
  };
}

export function pickDefined(source, allowedFields) {
  const result = {};
  for (const key of allowedFields) {
    if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
}
