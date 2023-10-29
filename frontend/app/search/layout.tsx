export default function Layout({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto mb-20 flex flex-col px-5 lg:max-w-screen-lg xl:px-0">{children}</main>
}
