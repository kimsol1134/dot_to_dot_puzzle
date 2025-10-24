import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            점잇기 퍼즐 생성기
          </Link>
          <div className="flex gap-6">
            <Link
              href="/"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              홈
            </Link>
            <Link
              href="/editor"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              퍼즐 만들기
            </Link>
            <Link
              href="/guides"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              사용 가이드
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
