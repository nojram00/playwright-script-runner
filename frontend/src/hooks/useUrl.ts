export default function useURL() {
    return {
        url : import.meta.env['DEV'] ? 'http://127.0.0.1:8089' : window.location.origin
    }
}