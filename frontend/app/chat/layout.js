// Keeps the RAG test page out of the index.
//
// /chat is a throwaway prototype harness, but it inherited `robots: { index:
// true }` from the root layout, so search engines were free to index a debug
// page as part of the site. page.js itself is a client component and can't
// export metadata, hence this layout.

export const metadata = {
  robots: { index: false, follow: false },
}

export default function ChatLayout({ children }) {
  return children
}
