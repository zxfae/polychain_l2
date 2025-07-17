export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'create_transaction' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Float64],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'get_balance' : IDL.Func([IDL.Text], [IDL.Float64], ['query']),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
