'use client';

import {
  FormEvent,
  useRef,
  useState,
} from 'react';

import {
  usePathname,
} from 'next/navigation';

import ReactMarkdown
  from 'react-markdown';

import remarkGfm
  from 'remark-gfm';

type RecordContext = {
  recordType:
    | 'contact'
    | 'organization'
    | 'event'
    | 'membership';

  recordId: string;
  path: string;
  label: string;
};

function getRecordContext(
  pathname: string
): RecordContext | null {
  const patterns: Array<{
    regex: RegExp;
    recordType:
      RecordContext['recordType'];
    label: string;
  }> = [
    {
      regex:
        /^\/club\/contacts\/([^/]+)(?:\/.*)?$/,
      recordType: 'contact',
      label: 'Contact',
    },
    {
      regex:
        /^\/club\/organizations\/([^/]+)(?:\/.*)?$/,
      recordType: 'organization',
      label: 'Organization',
    },
    {
      regex:
        /^\/club\/events\/([^/]+)(?:\/.*)?$/,
      recordType: 'event',
      label: 'Event',
    },
    {
      regex:
        /^\/club\/members\/([^/]+)(?:\/.*)?$/,
      recordType: 'membership',
      label: 'Membership',
    },
  ];

  for (const pattern of patterns) {
    const match =
      pathname.match(pattern.regex);

    const recordId =
      match?.[1];

    if (
      recordId &&
      recordId !== 'new'
    ) {
      return {
        recordType:
          pattern.recordType,

        recordId,

        path:
          pathname,

        label:
          pattern.label,
      };
    }
  }

  return null;
}

type Message = {
  id: number;

  role:
    | 'user'
    | 'assistant'
    | 'error';

  text: string;
};

const SUGGESTED_PROMPTS = [
  'What needs my attention?',
  'Which tasks are overdue?',
  'What events are coming up?',
  'How many active members do we have?',
];

export default function LionsAiPanel() {
  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    prompt,
    setPrompt,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    messages,
    setMessages,
  ] =
    useState<Message[]>([]);

  const nextId =
    useRef(1);

  const pathname =
    usePathname();

  const recordContext =
    getRecordContext(
      pathname
    );

  const suggestedPrompts =
    recordContext
      ? [
          'Summarize this record.',
          'What should I know about this record?',
          'Are there any open tasks for this record?',
          'What activity is associated with this record?',
        ]
      : SUGGESTED_PROMPTS;

  async function askAi(
    question: string
  ) {
    const cleanQuestion =
      question.trim();

    if (
      !cleanQuestion ||
      loading
    ) {
      return;
    }

    const userMessage:
      Message = {
      id:
        nextId.current++,

      role: 'user',

      text:
        cleanQuestion,
    };

    const conversation =
      [
        ...messages.filter(
          (message) =>
            message.role ===
              'user' ||
            message.role ===
              'assistant'
        ),

        userMessage,
      ]
        .slice(-10)
        .map(
          (message) => ({
            role:
              message.role,

            content:
              message.text,
          })
        );

    setMessages(
      (current) => [
        ...current,
        userMessage,
      ]
    );

    setPrompt('');
    setLoading(true);

    try {
      const response =
        await fetch(
          '/api/ai/chat',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                messages:
                  conversation,

                context:
                  recordContext
                    ? {
                        recordType:
                          recordContext.recordType,

                        recordId:
                          recordContext.recordId,

                        path:
                          recordContext.path,
                      }
                    : null,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Lions AI could not process the request.'
        );
      }

      const assistantMessage:
        Message = {
        id:
          nextId.current++,

        role:
          'assistant',

        text:
          typeof data?.text ===
            'string' &&
          data.text.trim()
            ? data.text
            : 'Lions AI returned an empty response.',
      };

      setMessages(
        (current) => [
          ...current,
          assistantMessage,
        ]
      );
    } catch (error) {
      const errorMessage:
        Message = {
        id:
          nextId.current++,

        role:
          'error',

        text:
          error instanceof
          Error
            ? error.message
            : 'Unable to contact Lions AI.',
      };

      setMessages(
        (current) => [
          ...current,
          errorMessage,
        ]
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await askAi(prompt);
  }

  function clearConversation() {
    if (loading) {
      return;
    }

    setMessages([]);
    setPrompt('');
  }

  return (
    <>
      <button
        type="button"
        className="lions-ai-launcher"
        onClick={() =>
          setOpen(true)
        }
        aria-label="Open Lions AI"
        aria-expanded={open}
      >
        <span
          className="lions-ai-launcher-icon"
          aria-hidden="true"
        >
          ✦
        </span>

        <span
          className="lions-ai-launcher-text"
        >
          <strong>
            Lions AI
          </strong>

          <small>
            Ask your CRM
          </small>
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="lions-ai-backdrop"
            onClick={() =>
              setOpen(false)
            }
            aria-label="Close Lions AI"
          />

          <aside
            className="lions-ai-panel"
            aria-label="Lions AI assistant"
          >
            <header
              className="lions-ai-header"
            >
              <div
                className="lions-ai-title-wrap"
              >
                <div
                  className="lions-ai-title-icon"
                  aria-hidden="true"
                >
                  ✦
                </div>

                <div>
                  <h2>
                    Lions AI
                  </h2>

                  <p>
                    Port Allegany Lions CRM Assistant
                  </p>
                </div>
              </div>

              <div
                className="lions-ai-header-actions"
              >
                {messages.length >
                  0 && (
                  <button
                    type="button"
                    className="lions-ai-clear"
                    onClick={
                      clearConversation
                    }
                    disabled={
                      loading
                    }
                  >
                    Clear
                  </button>
                )}

                <button
                  type="button"
                  className="lions-ai-close"
                  onClick={() =>
                    setOpen(false)
                  }
                  aria-label="Close Lions AI"
                >
                  ×
                </button>
              </div>
            </header>

            <div
              className="lions-ai-readonly-banner"
            >
              <span
                aria-hidden="true"
              >
                ●
              </span>

              Read-only CRM access
              {recordContext && (
                <>
                  {' '}• Viewing {recordContext.label}
                </>
              )}
            </div>

            <div
              className="lions-ai-body"
            >
              {messages.length ===
              0 ? (
                <div
                  className="lions-ai-empty"
                >
                  <div
                    className="lions-ai-empty-icon"
                  >
                    ✦
                  </div>

                  <h3>
                    What would you like to know?
                  </h3>

                  <p>
                    Ask about contacts,
                    members, organizations,
                    events, donations,
                    tasks, or partner
                    inquiries.
                  </p>

                  <div
                    className="lions-ai-suggestions"
                  >
                    {suggestedPrompts.map(
                      (
                        suggestion
                      ) => (
                        <button
                          type="button"
                          key={
                            suggestion
                          }
                          onClick={() =>
                            askAi(
                              suggestion
                            )
                          }
                          disabled={
                            loading
                          }
                        >
                          {
                            suggestion
                          }
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className="lions-ai-conversation"
                >
                  {messages.map(
                    (message) => (
                      <div
                        key={
                          message.id
                        }
                        className={`lions-ai-message lions-ai-message-${message.role}`}
                      >
                        <div
                          className="lions-ai-message-label"
                        >
                          {message.role ===
                          'user'
                            ? 'You'
                            : message.role ===
                                'assistant'
                              ? 'Lions AI'
                              : 'Error'}
                        </div>

                        <div
                          className="lions-ai-message-content"
                        >
                          {message.role ===
                          'assistant' ? (
                            <ReactMarkdown
                              remarkPlugins={[
                                remarkGfm,
                              ]}
                            >
                              {
                                message.text
                              }
                            </ReactMarkdown>
                          ) : (
                            message.text
                          )}
                        </div>
                      </div>
                    )
                  )}

                  {loading && (
                    <div
                      className="lions-ai-message lions-ai-message-assistant"
                    >
                      <div
                        className="lions-ai-message-label"
                      >
                        Lions AI
                      </div>

                      <div
                        className="lions-ai-thinking"
                      >
                        <span />
                        <span />
                        <span />

                        Checking the CRM
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <form
              className="lions-ai-composer"
              onSubmit={
                handleSubmit
              }
            >
              <textarea
                value={
                  prompt
                }
                onChange={(
                  event
                ) =>
                  setPrompt(
                    event.target
                      .value
                  )
                }
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                      'Enter' &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();

                    if (
                      prompt.trim() &&
                      !loading
                    ) {
                      event.currentTarget
                        .form
                        ?.requestSubmit();
                    }
                  }
                }}
                placeholder="Ask Lions AI about your CRM..."
                rows={3}
                maxLength={
                  4000
                }
                disabled={
                  loading
                }
              />

              <div
                className="lions-ai-composer-footer"
              >
                <span>
                  Enter to send ·
                  Shift+Enter for
                  new line
                </span>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !prompt.trim()
                  }
                >
                  {loading
                    ? 'Working...'
                    : 'Ask AI'}
                </button>
              </div>
            </form>
          </aside>
        </>
      )}
    </>
  );
}
