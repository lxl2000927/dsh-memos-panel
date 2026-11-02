import {createRequire} from 'node:module';
import {isAbsolute} from 'node:path';

// Desktop and CLI profiles can omit optional SDK peers. Resolve those peers
// from the running host entry without creating links or changing module paths.
export function createHostRequire(upstreamRequire,entry=process.argv[1]){
  const hostRequire=typeof entry==='string'&&isAbsolute(entry)?createRequire(entry):undefined;
  return name=>{
    let resolved;
    try{resolved=upstreamRequire.resolve(name);}
    catch(error){
      if(error.code!=='MODULE_NOT_FOUND'||!hostRequire)throw error;
      resolved=hostRequire.resolve(name);
    }
    // Loading is deliberately outside the fallback: dependency/runtime errors
    // inside a resolved SDK must surface, not load a different copy silently.
    return upstreamRequire(resolved);
  };
}
