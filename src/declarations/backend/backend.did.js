export const idlFactory = ({ IDL }) => {
  const Score = IDL.Record({ 'player' : IDL.Text, 'score' : IDL.Nat });
  return IDL.Service({
    'addScore' : IDL.Func([IDL.Text, IDL.Nat], [], []),
    'getTopScores' : IDL.Func([], [IDL.Vec(Score)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
