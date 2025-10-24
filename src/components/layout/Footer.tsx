export default function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            사랑하는 딸을 위한 점잇기 퍼즐 생성기
          </p>
          <p className="text-xs text-muted-foreground">
            © 2025 점잇기 퍼즐 생성기. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            모든 이미지 처리는 브라우저에서 진행되며 서버로 전송되지 않습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
