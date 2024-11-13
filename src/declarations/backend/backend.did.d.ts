import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Score { 'player' : string, 'score' : bigint }
export interface _SERVICE {
  'addScore' : ActorMethod<[string, bigint], undefined>,
  'getTopScores' : ActorMethod<[], Array<Score>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];