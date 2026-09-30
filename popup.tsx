import { useState } from "react"

function IndexPopup() {
  const [data, setData] = useState<any>(null)

  const handleDataExtraction = async () => {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    const tab = tabs[0]

    if (!tab.id) return

    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },

      func: () => {
        const links = Array.from(document.querySelectorAll("a"))

        const httpLinks = links
          .map((link) => (link as HTMLAnchorElement).href)
          .filter((url) => url.startsWith("http"))

        const uniqueLinks = [...new Set(httpLinks)]

        const images = document.querySelectorAll("img")
        const headings = document.querySelectorAll("h1, h2, h3")
        const text = document.body.innerText

        const externalLinks = links.filter((link) => {
          try {
            return (
              new URL(
                (link as HTMLAnchorElement).href
              ).hostname !== location.hostname
            )
          } catch {
            return false
          }
        })

        return {
          title: document.title,

          wordCount: text.trim().split(/\s+/).length,

          characterCount: text.length,

          headingsCount: headings.length,

          linksCount: links.length,

          imagesCount: images.length,

          externalLinksCount: externalLinks.length,

          uniqueLinks: uniqueLinks
        }
      }
    })

    setData(result[0].result)
  }

  return (
    <div
      style={{
        width: "350px",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >
      <h2>Page Analyzer</h2>

      <button
        onClick={handleDataExtraction}
        style={{
          width: "100%",
          padding: "10px",
          cursor: "pointer"
        }}
      >
        Analyze Page
      </button>

      {data && (
        <div style={{ marginTop: "20px" }}>
          <h3>{data.title}</h3>

          <div>
            <p>📝 Words: {data.wordCount}</p>
            <p>🔤 Characters: {data.characterCount}</p>
            <p>📑 Headings: {data.headingsCount}</p>
            <p>🔗 Links: {data.linksCount}</p>
            <p>🌐 External Links: {data.externalLinksCount}</p>
            <p>🖼️ Images: {data.imagesCount}</p>
            <p>🔗 Unique HTTP Links: {data.uniqueLinks.length}</p>
          </div>

          <h4>Links</h4>

          <div>
            {data.uniqueLinks.map((url: string, index: number) => (
              <p key={index}>
                {url}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default IndexPopup