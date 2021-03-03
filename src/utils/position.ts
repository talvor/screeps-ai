export const serializePostion = (pos: RoomPosition): string => {
  return `${pos.roomName}:${pos.x}:${pos.y}`;
};

export const deserializePostion = (pos: string): RoomPosition => {
  const parts = pos.split(':');
  const roomName = parts[0];
  const x = parseInt(parts[1], 10);
  const y = parseInt(parts[2], 10);

  return new RoomPosition(x, y, roomName);
};
