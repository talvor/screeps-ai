export const serializePosition = (pos: RoomPosition): string => {
  return `${pos.roomName}:${pos.x}:${pos.y}`;
};

export const deserializePosition = (pos: string): RoomPosition => {
  const parts = pos.split(':');
  const roomName = parts[0];
  const x = parseInt(parts[1], 10);
  const y = parseInt(parts[2], 10);

  return new RoomPosition(x, y, roomName);
};

export const positionEquals = function (pos1: RoomPosition, pos2: RoomPosition): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y && pos1.roomName === pos2.roomName;
};
