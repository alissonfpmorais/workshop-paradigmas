function IOError(error) {
  this.name = "IOError";

  if (typeof error === 'string') this.message = error;
  else if (error instanceof Error) this.message = error.message;
  else this.message = 'Unknown error';
}

IOError.prototype = Error.prototype;
IOError.prototype.constructor = IOError;
IOError.prototype.lift = IOError.lift = (error) => {
  throw new IOError(error);
};

function IO(computation) {
  this.computation = computation;
}

IO.prototype.of = IO.of = (value) => {
  return new IO((resolve) => resolve(value));
}

IO.prototype.raise = IO.raise = (error) => {
  return IO.of(error).map(IOError.lift);
}

IO.prototype.flatMap = function(fn) {
  const computation = this.computation;
  return new IO((resolve) => {
    return computation(async (value) => {
      return await (await fn(value)).computation(async (nextValue) => {
        return await resolve(nextValue);
      });
    });
  });
}

IO.prototype.map = function(fn) {
  const io = this;
  return io.flatMap(async (value) => {
    return IO.of(await fn(value));
  });
}

IO.prototype.tap = function(fn) {
  return this.map(async (value) => {
    await fn(value);
    return value;
  });
}

IO.prototype.zip = function(ioMonad, fn) {
  return this.map(async (value) => {
    const { data, error } = await ioMonad.run();
    if (error !== undefined) IOError.lift(error);
    return fn(value, data);
  });
}

IO.prototype.run = async function() {
  try {
    const data = await this.computation((x) => x);
    return { data };
  } catch(error) {
    return { error: new IOError(error) };
  }
};

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.exports = {
  IO,
  IOError,
  deepCopy,
}