import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Id } from "@/lib/api";
import { useDocuments, useMutateEmoji, useMutateTitle } from "@/hooks/use-convex";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EmojiPicker, EmojiPickerSearch, EmojiPickerContent } from "@/components/custom/emoji-picker";
import { Input } from "@/components/ui/input";
import { useParams } from "@tanstack/react-router";

export function BreadcrumbComponent() {

    const { data: documents } = useDocuments()
    const { mutate: mutateEmoji } = useMutateEmoji()
    const { mutate: mutateTitle } = useMutateTitle()
    const params = useParams({ from: '/_authenticated/_layout/document/$docId', shouldThrow: false })
    if (!params?.docId) return null
    const docId = params.docId as Id<'documents'>
    const document = documents?.find((doc) => doc._id === params.docId)

    return (
      <Breadcrumb>
        <BreadcrumbList className="gap-0">
          <BreadcrumbItem>
            <Button variant="ghost" className="h-6 px-1 gap-1 text-foreground">
              Agents
            </Button>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="h-6 px-1 gap-1 text-foreground">
                  <span className="text-base leading-none">{document?.emoji}</span>
                  <span>{document?.title || 'New document'}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-1.5 flex flex-row items-center gap-1.5">
                <Popover>
                  <PopoverTrigger asChild>
                    <span className="size-7 min-w-7 min-h-7 flex items-center justify-center border rounded-md cursor-pointer">{document?.emoji}</span>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 max-h-64 overflow-y-auto" align="start" alignOffset={-7} sideOffset={8}>
                    <EmojiPicker onEmojiSelect={(emoji) => mutateEmoji({ docId, emoji: emoji.emoji })}>
                      <EmojiPickerSearch />
                      <EmojiPickerContent />
                    </EmojiPicker>
                  </PopoverContent>
                </Popover>
                <Input
                  value={document?.title}
                  className='shadow-none h-7 px-2'
                  placeholder="New document"
                  onChange={(e) => mutateTitle({ docId, title: e.target.value })}
                />  
              </PopoverContent>
            </Popover>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }
