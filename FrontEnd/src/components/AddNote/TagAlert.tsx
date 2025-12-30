import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

function TagAlert() {
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Tags Required</AlertTitle>
                <AlertDescription>
                    Please add at least one tag to your note.
                </AlertDescription>
            </Alert>
        </div>
    )
}

export default TagAlert
