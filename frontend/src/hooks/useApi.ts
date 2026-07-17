import { useState } from "react";

export default function useApi() {
    const url = import.meta.env['DEV'] ? 'http://127.0.0.1:8089' : window.location.origin;
    
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const sendScript = async (script : string) => {
        
        try {
            setIsLoading(true);
            const response = await fetch(`${url}/test`, {
                headers : {
                    "Content-Type" : "application/javascript"
                },
                body: script,
                method: 'POST'
            });

            const data = await response.json()
            if (!response.ok) {
                setError(data.message || 'Script execution failed')
            }
            else {
                setResult(data.result)
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred')
        }
        finally {
            setIsLoading(false)
        }
    }

    const downloadResult = () => {
        if (result == null) return;
        const a = document.createElement('a');
        const file = new Blob([JSON.stringify(result, null, 2)], {
            type: "application/json"
        })
        const new_url = URL.createObjectURL(file)
        a.href = new_url
        a.download = `result-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
        a.click()
        URL.revokeObjectURL(new_url)
    }

    const clearDefault = () => {
        setResult(null)
        setError(null)
    }

    return {
        sendScript,
        clearDefault,
        downloadResult,
        isLoading,
        result,
        error
    }
}