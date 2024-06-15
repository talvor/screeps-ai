export const packPos = (pos: RoomPosition): string => {
  return [pos.x, pos.y, pos.roomName].join("|");
};

export const unpackPos = (pos: string): RoomPosition => {
  const parts = pos.split("|");
  return new RoomPosition(Number(parts[0]), Number(parts[1]), parts[2]);
};
