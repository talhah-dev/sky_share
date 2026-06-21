import FileShare from "@/components/Fileshare"
import TextShare from "@/components/Textshare"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { File, Type } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-6">

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">SkyShare</h1>
          <p className="text-sm text-muted-foreground">
            Share files and text with anyone, anywhere.
          </p>
        </div>

        <Tabs defaultValue="file" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="file" className="flex-1 gap-2">
              <File className="w-4 h-4" />
              File
            </TabsTrigger>
            <TabsTrigger value="text" className="flex-1 gap-2">
              <Type className="w-4 h-4" />
              Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file">
            <FileShare />
          </TabsContent>

          <TabsContent value="text">
            <TextShare />
          </TabsContent>
        </Tabs>

      </div>
    </main>
  )
}