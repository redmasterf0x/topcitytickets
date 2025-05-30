"use client"

import {
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  WhatsappIcon,
  EmailShareButton,
  EmailIcon,
} from "react-share"
import { LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface SocialShareButtonsProps {
  url: string
  title: string
  className?: string
}

export function SocialShareButtons({ url, title, className }: SocialShareButtonsProps) {
  const { toast } = useToast()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(
      () => {
        toast({
          title: "Link Copied!",
          description: "Event link copied to your clipboard.",
        })
      },
      (err) => {
        toast({
          title: "Failed to Copy",
          description: "Could not copy link to clipboard.",
          variant: "destructive",
        })
        console.error("Failed to copy text: ", err)
      },
    )
  }

  const iconSize = 32
  const gap = "gap-3" // Tailwind class for gap

  return (
    <div className={`flex flex-wrap ${gap} ${className || ""}`}>
      <FacebookShareButton url={url} quote={title}>
        <FacebookIcon size={iconSize} round />
      </FacebookShareButton>

      <TwitterShareButton url={url} title={title}>
        <TwitterIcon size={iconSize} round />
      </TwitterShareButton>

      <LinkedinShareButton url={url} title={title} summary="Check out this event!">
        <LinkedinIcon size={iconSize} round />
      </LinkedinShareButton>

      <WhatsappShareButton url={url} title={title} separator=":: ">
        <WhatsappIcon size={iconSize} round />
      </WhatsappShareButton>

      <EmailShareButton url={url} subject={title} body={`Check out this event: ${url}`}>
        <EmailIcon size={iconSize} round />
      </EmailShareButton>

      <Button
        variant="outline"
        size="icon"
        onClick={copyToClipboard}
        className="rounded-full border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white w-8 h-8 p-0"
        aria-label="Copy event link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
