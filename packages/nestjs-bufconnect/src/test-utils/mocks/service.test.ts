import { Message, MethodKind, proto3 } from '@bufbuild/protobuf';

export interface SayR extends Message<SayR> {
  sentence: string;
}

export const SayRMessage = proto3.makeMessageType<SayR>(
  'buf.connect.demo.eliza.v1.SayRequest',
  [{ no: 1, name: 'sentence', kind: 'scalar', T: 9 /* ScalarType.STRING */ }]
);

export const ElizaTestService = {
  typeName: 'buf.connect.demo.eliza.v1.ElizaService',
  methods: {
    say: {
      name: 'Say',
      I: SayRMessage,
      O: SayRMessage,
      kind: MethodKind.Unary,
    },
  },
} as const;
