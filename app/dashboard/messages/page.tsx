"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, formatDistanceToNow } from "date-fns"
import { io, type Socket } from "socket.io-client"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCheck,
  FileText,
  ImageIcon,
  Loader2,
  MessageSquareText,
  Paperclip,
  RefreshCw,
  Search,
  Send,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  createChatAttachmentUpload,
  getChatAttachmentUrl,
  getChatMessages,
  getChatSocketToken,
  getChatThreads,
  markChatRead,
  putChatAttachment,
  sendChatMessage,
  type ChatAttachment,
  type ChatMessage,
  type ChatThread,
} from "@/lib/api"

const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
])
const MAX_FILE_BYTES = 10 * 1024 * 1024

function messagePreview(thread: ChatThread) {
  const message = thread.lastMessage
  if (!message) return "No messages yet"
  if (message.text) return message.text
  if (message.attachment?.mimeType === "application/pdf") return "PDF document"
  return "Image attachment"
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function AttachmentBubble({ attachment }: { attachment: ChatAttachment }) {
  const urlQuery = useQuery({
    queryKey: ["chat-attachment-url", attachment.id],
    queryFn: () => getChatAttachmentUrl(attachment.id),
    staleTime: 4 * 60 * 1000,
  })
  const url = urlQuery.data?.data.downloadUrl
  const isImage = attachment.mimeType.startsWith("image/")

  if (urlQuery.isLoading) {
    return (
      <div className="mt-2 flex min-h-16 items-center justify-center rounded-lg border border-current/15 bg-background/30 px-6">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }
  if (!url) {
    return (
      <button
        className="mt-2 flex items-center gap-2 rounded-lg border border-current/15 bg-background/30 px-3 py-2 text-xs"
        onClick={() => void urlQuery.refetch()}
      >
        <RefreshCw className="h-3.5 w-3.5" /> Retry attachment
      </button>
    )
  }
  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="mt-2 block overflow-hidden rounded-lg">
        {/* Signed object-storage URLs are intentionally rendered without Next image optimization. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={attachment.fileName}
          className="max-h-64 w-full max-w-sm object-cover transition hover:opacity-90"
        />
      </a>
    )
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-2 flex items-center gap-3 rounded-lg border border-current/15 bg-background/30 p-3 transition hover:bg-background/50"
    >
      <FileText className="h-8 w-8 shrink-0" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{attachment.fileName}</span>
        <span className="block text-xs opacity-70">{(attachment.byteSize / 1024 / 1024).toFixed(1)} MB PDF</span>
      </span>
    </a>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const mine = message.senderRole === "HOSPITAL"
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm md:max-w-[72%]",
          mine
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border bg-card",
        )}
      >
        {message.text && <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>}
        {message.attachment && <AttachmentBubble attachment={message.attachment} />}
        <div className={cn("mt-1 flex items-center justify-end gap-1 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
          <span>{format(new Date(message.createdAt), "h:mm a")}</span>
          {mine && <CheckCheck className={cn("h-3.5 w-3.5", message.readAt && "text-blue-300")} aria-label={message.readAt ? "Read" : "Sent"} />}
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)
  const threadIdsRef = useRef<number[]>([])
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedConditionId, setSelectedConditionId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const threadsQuery = useInfiniteQuery({
    queryKey: ["chat-threads"],
    queryFn: ({ pageParam }: { pageParam: number | undefined }) => getChatThreads(pageParam, 30),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (page) => page.data.nextCursor ?? undefined,
  })
  const threads = useMemo(
    () => threadsQuery.data?.pages.flatMap((page) => page.data.threads) ?? [],
    [threadsQuery.data],
  )
  const filteredThreads = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return threads
    return threads.filter((thread) =>
      [
        thread.condition.patient.name,
        thread.condition.patient.mobileNumber,
        thread.condition.disease.name,
        thread.condition.HospitalPatientId || "",
      ].some((value) => value.toLowerCase().includes(query)),
    )
  }, [search, threads])
  const selectedThread = threads.find((thread) => thread.conditionId === selectedConditionId) ?? null
  const totalUnread = threads.reduce((sum, thread) => sum + thread.unreadCount, 0)

  useEffect(() => {
    threadIdsRef.current = threads.map((thread) => thread.conditionId)
  }, [threads])

  useEffect(() => {
    if (selectedConditionId === null && threads[0]) {
      setSelectedConditionId(threads[0].conditionId)
    }
  }, [selectedConditionId, threads])

  const messagesQuery = useInfiniteQuery({
    queryKey: ["chat-messages", selectedConditionId],
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      getChatMessages(selectedConditionId!, pageParam, 50),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (page) => page.data.nextCursor ?? undefined,
    enabled: selectedConditionId !== null,
  })
  const messages = useMemo(
    () =>
      messagesQuery.data?.pages
        .slice()
        .reverse()
        .flatMap((page) => page.data.messages) ?? [],
    [messagesQuery.data],
  )

  const socketTokenQuery = useQuery({
    queryKey: ["chat-socket-token"],
    queryFn: getChatSocketToken,
    staleTime: 4 * 60 * 1000,
    refetchInterval: 4 * 60 * 1000,
  })

  useEffect(() => {
    const token = socketTokenQuery.data?.data.token
    if (!token) return
    const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || window.location.origin
    const socket = io(socketUrl, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: { token },
    })
    socketRef.current = socket
    socket.on("connect", () => {
      threadIdsRef.current.forEach((conditionId) => socket.emit("chat:join", { conditionId }))
    })
    socket.on("connect_error", (error) => console.warn("Chat connection failed", error.message))
    socket.on("message:new", (event: { conditionId: number }) => {
      void queryClient.invalidateQueries({ queryKey: ["chat-threads"] })
      void queryClient.invalidateQueries({ queryKey: ["chat-messages", event.conditionId] })
    })
    socket.on("thread:updated", () => {
      void queryClient.invalidateQueries({ queryKey: ["chat-threads"] })
    })
    socket.on("thread:read", (event: { conditionId: number }) => {
      void queryClient.invalidateQueries({ queryKey: ["chat-messages", event.conditionId] })
    })
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [queryClient, socketTokenQuery.data?.data.token])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return
    threads.forEach((thread) => socket.emit("chat:join", { conditionId: thread.conditionId }))
  }, [threads, socketTokenQuery.data?.data.token])

  const readMutation = useMutation({
    mutationFn: ({ conditionId, messageId }: { conditionId: number; messageId: number }) =>
      markChatRead(conditionId, messageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat-threads"] })
    },
  })

  useEffect(() => {
    const lastMessage = messages.at(-1)
    if (
      selectedThread &&
      selectedThread.unreadCount > 0 &&
      lastMessage &&
      !readMutation.isPending
    ) {
      readMutation.mutate({
        conditionId: selectedThread.conditionId,
        messageId: lastMessage.id,
      })
    }
  }, [messages, readMutation.isPending, selectedThread?.conditionId, selectedThread?.unreadCount])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.at(-1)?.id])

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!selectedThread) throw new Error("Select a conversation")
      let attachmentId: string | undefined
      if (file) {
        setUploadProgress(0)
        const presigned = await createChatAttachmentUpload(selectedThread.conditionId, file)
        await putChatAttachment(
          presigned.data.uploadUrl,
          file,
          presigned.data.requiredHeaders,
          setUploadProgress,
        )
        attachmentId = presigned.data.attachmentId
      }
      return sendChatMessage(selectedThread.conditionId, {
        clientMessageId: crypto.randomUUID(),
        text: text.trim() || undefined,
        attachmentId,
      })
    },
    onSuccess: () => {
      setText("")
      setFile(null)
      setUploadProgress(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      void queryClient.invalidateQueries({ queryKey: ["chat-threads"] })
      void queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedConditionId] })
    },
    onError: (error: Error) => {
      setUploadProgress(null)
      toast.error("Message not sent", { description: error.message })
    },
  })

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0]
    if (!nextFile) return
    if (!ALLOWED_FILE_TYPES.has(nextFile.type)) {
      toast.error("Choose a JPG, PNG, WEBP, or PDF file")
      event.target.value = ""
      return
    }
    if (nextFile.size > MAX_FILE_BYTES) {
      toast.error("Attachments must be 10 MB or smaller")
      event.target.value = ""
      return
    }
    setFile(nextFile)
  }

  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if ((text.trim() || file) && !sendMutation.isPending) sendMutation.mutate()
    }
  }

  if (threadsQuery.isError) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-3 h-9 w-9 text-destructive" />
          <h1 className="text-lg font-semibold">Could not load messages</h1>
          <p className="mb-4 text-sm text-muted-foreground">{(threadsQuery.error as Error).message}</p>
          <Button onClick={() => void threadsQuery.refetch()}>Try again</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-3 overflow-hidden p-3 md:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground">Secure conversations for each patient condition</p>
        </div>
        {totalUnread > 0 && <Badge>{totalUnread} unread</Badge>}
      </div>

      <div className="grid min-h-0 flex-1 overflow-hidden rounded-xl border bg-card shadow-sm md:grid-cols-[340px_minmax(0,1fr)]">
        <section className={cn("min-h-0 border-r", selectedThread && "hidden md:block")}>
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patient or condition" className="pl-9" />
            </div>
          </div>
          <ScrollArea className="h-[calc(100svh-13rem)] md:h-[calc(100svh-12rem)]">
            {threadsQuery.isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <MessageSquareText className="mx-auto mb-3 h-8 w-8 opacity-50" />
                {search ? "No matching conversations" : "No enrolled patient conversations yet"}
              </div>
            ) : (
              <div className="divide-y">
                {filteredThreads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedConditionId(thread.conditionId)}
                    className={cn(
                      "flex w-full gap-3 p-3 text-left transition hover:bg-muted/60",
                      selectedConditionId === thread.conditionId && "bg-muted",
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {initials(thread.condition.patient.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{thread.condition.patient.name}</span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(thread.lastActivityAt), { addSuffix: true })}
                        </span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="truncate">{thread.condition.disease.name}</span>
                        {!thread.writable && <Badge variant="outline" className="h-4 px-1 text-[9px]">Ended</Badge>}
                      </span>
                      <span className="mt-1 flex items-center justify-between gap-2">
                        <span className={cn("truncate text-xs", thread.unreadCount ? "font-medium text-foreground" : "text-muted-foreground")}>
                          {messagePreview(thread)}
                        </span>
                        {thread.unreadCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">{thread.unreadCount}</span>}
                      </span>
                    </span>
                  </button>
                ))}
                {threadsQuery.hasNextPage && (
                  <Button variant="ghost" className="m-3 w-[calc(100%-1.5rem)]" onClick={() => void threadsQuery.fetchNextPage()} disabled={threadsQuery.isFetchingNextPage}>
                    {threadsQuery.isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load more"}
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>
        </section>

        <section className={cn("min-h-0 flex-col", selectedThread ? "flex" : "hidden md:flex")}>
          {!selectedThread ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-muted-foreground">
              <div><MessageSquareText className="mx-auto mb-3 h-10 w-10 opacity-40" /><p>Select a patient conversation</p></div>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b p-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConditionId(null)}><ArrowLeft className="h-5 w-5" /></Button>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{initials(selectedThread.condition.patient.name)}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">{selectedThread.condition.patient.name}</h2>
                  <p className="truncate text-xs text-muted-foreground">
                    {selectedThread.condition.disease.name} · {selectedThread.condition.patient.mobileNumber}
                  </p>
                </div>
                {!selectedThread.writable && <Badge variant="secondary">Read only</Badge>}
              </header>

              <ScrollArea className="min-h-0 flex-1 bg-muted/20">
                <div className="mx-auto flex max-w-4xl flex-col gap-3 p-4">
                  <div className="mx-auto mb-2 max-w-lg rounded-lg border bg-background/80 px-3 py-2 text-center text-xs text-muted-foreground">
                    This chat is for care communication and is not monitored as an emergency service.
                  </div>
                  {messagesQuery.hasNextPage && (
                    <Button variant="ghost" size="sm" className="mx-auto" onClick={() => void messagesQuery.fetchNextPage()} disabled={messagesQuery.isFetchingNextPage}>
                      {messagesQuery.isFetchingNextPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Load older messages
                    </Button>
                  )}
                  {messagesQuery.isLoading ? (
                    <Loader2 className="mx-auto my-10 h-5 w-5 animate-spin" />
                  ) : messages.length === 0 ? (
                    <div className="my-10 text-center text-sm text-muted-foreground">Start the conversation with this patient.</div>
                  ) : (
                    messages.map((message, index) => {
                      const previous = messages[index - 1]
                      const showDate = !previous || format(new Date(previous.createdAt), "yyyy-MM-dd") !== format(new Date(message.createdAt), "yyyy-MM-dd")
                      return (
                        <div key={message.id}>
                          {showDate && <div className="my-3 text-center text-[11px] text-muted-foreground">{format(new Date(message.createdAt), "PPP")}</div>}
                          <MessageBubble message={message} />
                        </div>
                      )
                    })
                  )}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              {selectedThread.writable ? (
                <footer className="border-t p-3">
                  {file && (
                    <div className="mb-2 flex items-center gap-2 rounded-lg border bg-muted/40 p-2 text-xs">
                      {file.type === "application/pdf" ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                      <span className="min-w-0 flex-1 truncate">{file.name}</span>
                      <span className="text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" disabled={sendMutation.isPending} onClick={() => setFile(null)}><X className="h-3.5 w-3.5" /></Button>
                    </div>
                  )}
                  {uploadProgress !== null && <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} /></div>}
                  <div className="flex items-end gap-2">
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={selectFile} />
                    <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={Boolean(file) || sendMutation.isPending} aria-label="Attach image or PDF"><Paperclip className="h-4 w-4" /></Button>
                    <Textarea value={text} onChange={(event) => setText(event.target.value)} onKeyDown={onComposerKeyDown} placeholder="Write a message…" rows={1} maxLength={4000} disabled={sendMutation.isPending} className="max-h-32 min-h-10 resize-none" />
                    <Button size="icon" disabled={(!text.trim() && !file) || sendMutation.isPending} onClick={() => sendMutation.mutate()} aria-label="Send message">
                      {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </footer>
              ) : (
                <footer className="border-t bg-muted/30 p-3 text-center text-sm text-muted-foreground">This care period has ended. Message history remains available.</footer>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}
