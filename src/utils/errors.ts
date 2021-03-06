export const errorCode: { [key: number]: string } = { 0: 'OK' };
errorCode[-1] = 'ERR_NOT_OWNER';
errorCode[-2] = 'ERR_NO_PATH';
errorCode[-3] = 'ERR_NAME_EXISTS';
errorCode[-4] = 'ERR_BUSY';
errorCode[-5] = 'ERR_NOT_FOUND';
errorCode[-6] = 'ERR_NOT_ENOUGH_ENERGY';
errorCode[-7] = 'ERR_INVALID_TARGET';
errorCode[-8] = 'ERR_FULL';
errorCode[-9] = 'ERR_NOT_IN_RANGE';
errorCode[-10] = 'ERR_INVALID_ARGS';
errorCode[-11] = 'ERR_TIRED';
errorCode[-12] = 'ERR_NO_BODYPART';
errorCode[-13] = 'ERR_NOT_ENOUGH_EXTENSIONS';
errorCode[-14] = 'ERR_RCL_NOT_ENOUGH';
errorCode[-15] = 'ERR_GCL_NOT_ENOUGH';

export const errorEmoji: { [key: number]: string } = { 0: '👍' }; // OK
errorEmoji[-1] = 'ERR_NOT_OWNER';
errorEmoji[-2] = '🚦 Traffic'; // ERR_NO_PATH
errorEmoji[-3] = 'ERR_NAME_EXISTS';
errorEmoji[-4] = 'ERR_BUSY';
errorEmoji[-5] = 'ERR_NOT_FOUND';
errorEmoji[-6] = 'ERR_NOT_ENOUGH_ENERGY';
errorEmoji[-7] = 'ERR_INVALID_TARGET';
errorEmoji[-8] = 'ERR_FULL';
errorEmoji[-9] = 'ERR_NOT_IN_RANGE';
errorEmoji[-10] = 'ERR_INVALID_ARGS';
errorEmoji[-11] = '😴 Tired'; // ERR_TIRED
errorEmoji[-12] = 'ERR_NO_BODYPART';
errorEmoji[-13] = 'ERR_NOT_ENOUGH_EXTENSIONS';
errorEmoji[-14] = 'ERR_RCL_NOT_ENOUGH';
errorEmoji[-15] = 'ERR_GCL_NOT_ENOUGH';

export const check = (obj: Creep | Structure | RoomPosition, action: string, code: number): boolean => {
  if (code !== OK) {
    const errMsg = errorCode[code] || 'UNKNOWN';
    if (obj instanceof Creep) {
      let msg = errorEmoji[code];
      if (code === ERR_TIRED && obj.fatigue) msg += ` ${obj.fatigue}`;
      obj.say(msg);
    }
    if (code !== ERR_TIRED) {
      // @ts-ignore
      const pos = obj.pos || '';
      // @ts-ignore
      console.log(`${obj} ${pos} could not perform ${action}: ${errMsg}`);
    }
    return true;
  }
  return false;
};
