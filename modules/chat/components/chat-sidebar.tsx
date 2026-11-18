"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import UserButton from "@/modules/authentication/components/user-button";
import { PlusIcon, SearchIcon, EllipsisIcon, Trash } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useRef, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { isToday, isYesterday, isWithinInterval, subDays } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import DeleteChatModel from "@/components/delete-chat-model";
import { useGetChats } from "../hooks/use-chats";
import { Spinner } from "@/components/ui/spinner";

function groupChatsByDate(chats: any) {
  const groups: Record<string, any[]> = { today: [], yesterday: [], lastWeek: [], older: [] };
  const now = new Date();

  if (!chats || !Array.isArray(chats)) return groups;

  chats.forEach((chat) => {
    try {
      const chatDate = chat.createdAt;
      const date = typeof chatDate === "string" ? new Date(chatDate) : chatDate;
      
      console.log("Processing chat:", chat.id, "Date:", date, "createdAt:", chatDate);

      if (isToday(date)) {
        groups.today.push(chat);
      } else if (isYesterday(date)) {
        groups.yesterday.push(chat);
      } else if (isWithinInterval(date, { start: subDays(now, 7), end: now })) {
        groups.lastWeek.push(chat);
      } else {
        groups.older.push(chat);
      }
    } catch (error) {
      console.error("Error processing chat date:", error, chat);
      groups.older.push(chat);
    }
  });

  return groups;
}

const DATE_GROUPS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "lastWeek", label: "Last 7 Days" },
  { key: "older", label: "Older" },
];

interface ChatItemProps {
  chat: any;
  isActive: boolean;
  onDelete: (e: React.MouseEvent, chatId: string) => void;
}

function ChatItem({ chat, isActive, onDelete }: ChatItemProps) {
  return (
    <Link
      href={`/chat/${chat.id}`}
      className={cn(
        "flex items-center justify-between rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
        isActive && "bg-sidebar-accent",
      )}
    >
      <span className="truncate flex-1">{chat.title}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 hover:bg-sidebar-accent-foreground/10"
            onClick={(e) => e.preventDefault()}
          >
            <EllipsisIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-red-500 cursor-pointer"
            onClick={(e) => onDelete(e, chat.id)}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Link>
  );
}

interface ChatGroupProps {
  label: string;
  chats: any[];
  activeChatId: string | null;
  onDelete: (e: React.MouseEvent, chatId: string) => void;
}

function ChatGroup({ label, chats, activeChatId, onDelete }: ChatGroupProps) {
  if (chats.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
        {label}
      </div>
      {chats.map((chat: any) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

interface ChatSidebarProps {
  user: any;
}

const ChatSidebar = ({ user }: ChatSidebarProps) => {
   const { data: chats = [], isPending } = useGetChats();

   console.log("Fetched chats:", chats);
  const pathname = usePathname();
  const activeChatId = pathname?.startsWith("/chat/")
    ? pathname.split("/")[2]
    : null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery.trim().toLowerCase(), 200);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Keyboard shortcut: Cmd+K or Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredChats = useMemo(() => {
    if (!debouncedQuery) return chats;
    const tokens = debouncedQuery.split(/\s+/).filter(Boolean);

    return chats.filter((chat: any) => {
      const titleLower = chat.title?.toLowerCase() || "";
      const messagesCombined = Array.isArray(chat.messages)
        ? chat.messages.map((m: any) => m.content?.toLowerCase() || "").join(" ")
        : "";
      const haystack = `${titleLower} ${messagesCombined}`;

      // Multi-token match: all keywords must appear in either title or message
      return tokens.every((token) => haystack.includes(token));
    });
  }, [debouncedQuery, chats]);

  const groupedChats = useMemo(() => {
    const result = groupChatsByDate(filteredChats);
    console.log("Filtered chats:", filteredChats);
    console.log("Grouped chats:", result);
    return result;
  }, [filteredChats]);

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedChatId(chatId);
    setIsModalOpen(true);
  };

  if (isPending) {
    return <Spinner className="m-auto" />;
  }
  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      {/* Header */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Image src="/logo.svg" alt="NexusChat" width={128} height={32} className="h-8 w-auto text-foreground" priority />
      </div>

      <div className="p-4">
        <Button asChild className="w-full">
          <Link href="/">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Chat
          </Link>
        </Button>
      </div>

      <div className="px-4 pb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search threads..."
            className="pl-9 pr-12 bg-sidebar-accent border-sidebar-border text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm"
              aria-label="Clear search"
            >
              ×
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ⌘K
            </kbd>
          )}
        </div>
        {debouncedQuery && (
          <div className="mt-2 px-1 text-[11px] text-muted-foreground">
            {filteredChats.length} {filteredChats.length === 1 ? "result" : "results"} found
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {filteredChats.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            {searchQuery ? "No chats found" : "No chats yet"}
          </div>
        ) : (
          DATE_GROUPS.map((group) => (
            <ChatGroup
              key={group.key}
              label={group.label}
              chats={groupedChats[group.key]}
              activeChatId={activeChatId}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Footer */}

      <div className="p-4 flex items-center gap-3 border-t border-sidebar-border">
        <UserButton user={user} />
        <span className="flex-1 text-sm text-sidebar-foreground truncate">
          {user.email}
        </span>
      </div>

      <DeleteChatModel
        chatId={selectedChatId}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </div>
  );
};

export default ChatSidebar;
