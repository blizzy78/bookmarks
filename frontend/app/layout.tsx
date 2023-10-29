import BreakpointReadout from '@/components/BreakpointReadout'
import { RobotoCondensed, RobotoFlex } from '@/components/fonts'
import '@total-typescript/ts-reset'
import clsx from 'clsx'
import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bookmarks',
  icons: 'data:;base64,iVBORw0KGgo=',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={clsx(
          'font-roboto-flex dark:bg-slate-800 dark:text-slate-200',
          RobotoCondensed.variable,
          RobotoFlex.variable,
        )}
      >
        {children}

        {process.env.NODE_ENV !== 'production' && <BreakpointReadout className="fixed right-2 top-2 opacity-80" />}
      </body>
    </html>
  )
}
