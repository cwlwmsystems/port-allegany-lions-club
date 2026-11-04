import {
  generateText,
  stepCountIs,
} from 'ai';

import {
  createOpenAICompatible,
} from '@ai-sdk/openai-compatible';

import {
  NextResponse,
} from 'next/server';

import {
  LIONS_AI_INSTRUCTIONS,
} from '@/lib/ai/instructions';

import {
  lionsAiTools,
} from '@/lib/ai/tools';

import {
  createClient,
} from '@/lib/supabase/server';

export const runtime =
  'nodejs';

const ollama =
  createOpenAICompatible({
    name: 'ollama',

    baseURL:
      process.env
        .OLLAMA_BASE_URL ||
      'http://127.0.0.1:11434/v1',

    apiKey: 'ollama',
  });

type IncomingMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export async function POST(
  request: Request
) {
  try {
    const supabase =
      await createClient();

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !user
    ) {
      return NextResponse.json(
        {
          error:
            'Unauthorized',
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const incoming =
      Array.isArray(
        body?.messages
      )
        ? body.messages
        : [];

    const messages:
      IncomingMessage[] =
      incoming
        .filter(
          (message: any) =>
            (
              message?.role ===
                'user' ||
              message?.role ===
                'assistant'
            ) &&
            typeof message
              ?.content ===
              'string' &&
            message.content
              .trim()
        )
        .slice(-10)
        .map(
          (message: any) => ({
            role:
              message.role,

            content:
              message.content
                .trim()
                .slice(
                  0,
                  4000
                ),
          })
        );

    const legacyPrompt =
      typeof body?.prompt ===
        'string'
        ? body.prompt
            .trim()
            .slice(
              0,
              4000
            )
        : '';

    if (
      messages.length ===
        0 &&
      legacyPrompt
    ) {
      messages.push({
        role: 'user',
        content:
          legacyPrompt,
      });
    }

    if (
      messages.length ===
      0
    ) {
      return NextResponse.json(
        {
          error:
            'A message is required.',
        },
        {
          status: 400,
        }
      );
    }

    const rawContext =
      body?.context &&
      typeof body.context === 'object'
        ? body.context
        : null;

    const allowedRecordTypes = [
      'contact',
      'organization',
      'event',
      'membership',
    ] as const;

    const recordType =
      allowedRecordTypes.includes(
        rawContext?.recordType
      )
        ? rawContext.recordType
        : null;

    const recordId =
      typeof rawContext?.recordId ===
        'string'
        ? rawContext.recordId
            .trim()
            .slice(0, 100)
        : null;

    const currentPath =
      typeof rawContext?.path ===
        'string'
        ? rawContext.path
            .trim()
            .slice(0, 300)
        : null;

    const currentRecordInstructions =
      recordType &&
      recordId
        ? `

CURRENT PAGE CONTEXT

The user is currently viewing a ${recordType} CRM record.

Current record type: ${recordType}
Current record ID: ${recordId}
Current CRM path: ${currentPath || 'unknown'}

If the user refers to "this record", "this contact", "this organization",
"this event", "this member", "this membership", or similar contextual wording,
use the corresponding record-detail tool with the current record ID.

Never reveal the record ID merely because it was supplied here.
`
        : '';

    const result =
      await generateText({
        model:
          ollama(
            'qwen3:1.7b'
          ),

        instructions:
          LIONS_AI_INSTRUCTIONS +
          currentRecordInstructions +
          `

LOCAL MODEL RULES

You are running through a local Ollama model.

Do not expose hidden reasoning or chain-of-thought.

For CRM questions:
1. Choose the appropriate CRM tool.
2. Use the returned CRM data.
3. Give the user the useful conclusion.

Never guess CRM values.
`,

        messages,

        tools:
          lionsAiTools,

        stopWhen:
          stepCountIs(8),

        maxOutputTokens:
          1000,
      });

    return NextResponse.json({
      text:
        result.text,

      finishReason:
        result.finishReason,

      usage:
        result.totalUsage,
    });
  } catch (error) {
    console.error(
      'Lions AI error:',
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : 'Unable to process the AI request.',
      },
      {
        status: 500,
      }
    );
  }
}
