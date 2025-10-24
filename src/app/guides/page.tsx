import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';

export default function GuidesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">사용 가이드</h1>

      <div className="space-y-8">
        {/* 기본 사용법 */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">기본 사용법</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>홈페이지에서 "퍼즐 만들기 시작하기" 버튼을 클릭합니다</li>
            <li>이미지를 업로드합니다 (드래그 앤 드롭 또는 클릭)</li>
            <li>난이도 슬라이더로 점의 개수를 조절합니다</li>
            <li>시작점 위치를 선택합니다</li>
            <li>"퍼즐 만들기" 버튼을 클릭합니다</li>
            <li>생성된 퍼즐을 미리보기로 확인합니다</li>
            <li>"다운로드" 버튼을 클릭하여 PNG 파일로 저장합니다</li>
          </ol>
        </Card>

        {/* 좋은 이미지 */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">
            <CheckCircle className="inline w-6 h-6 text-green-500 mr-2" />
            잘 작동하는 이미지
          </h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>✅ 배경이 단색이거나 단순한 이미지 (예: 흰색 배경의 캐릭터)</li>
            <li>✅ 대상과 배경의 대비가 뚜렷한 이미지 (예: 파란 하늘 배경의 새)</li>
            <li>✅ 하나의 명확한 주제가 있는 이미지 (예: 단일 동물, 단일 캐릭터)</li>
            <li>✅ 내부 디테일이 적은 단순한 형태 (예: 만화 캐릭터 실루엣)</li>
          </ul>
        </Card>

        {/* 피해야 할 이미지 */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">
            <XCircle className="inline w-6 h-6 text-red-500 mr-2" />
            잘 작동하지 않는 이미지
          </h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>❌ 복잡한 배경 (풍경, 인테리어, 여러 사물)</li>
            <li>❌ 대상과 배경이 붙어있거나 대비가 낮은 이미지</li>
            <li>❌ 여러 개의 대상이 있는 이미지 (알고리즘은 가장 큰 것 1개만 선택)</li>
            <li>❌ 내부 디테일이 많은 이미지 (사진, 복잡한 일러스트)</li>
          </ul>
        </Card>

        {/* 기술적 제약 */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">기술적 제약사항</h2>
          <div className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">이미지 크기</h3>
              <ul className="space-y-1 ml-4">
                <li>• 권장: 500x500px ~ 1000x1000px</li>
                <li>• 최대: 2000x2000px (초과 시 자동 리사이징)</li>
                <li>• 파일 크기: 최대 5MB</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">처리 시간</h3>
              <ul className="space-y-1 ml-4">
                <li>• 데스크톱: 5초 이내</li>
                <li>• 모바일: 10초 이내</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">브라우저 지원</h3>
              <ul className="space-y-1 ml-4">
                <li>• Chrome, Firefox, Edge: 최신 버전 권장</li>
                <li>• Safari: 16.4 이상 권장</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 프라이버시 */}
        <Alert>
          <h3 className="font-semibold mb-2">🔒 프라이버시 보장</h3>
          <p className="text-sm text-muted-foreground">
            모든 이미지 처리는 브라우저에서 진행되며, 서버로 전송되지 않습니다. 업로드한
            이미지는 오직 여러분의 컴퓨터에만 저장됩니다.
          </p>
        </Alert>
      </div>
    </div>
  );
}
