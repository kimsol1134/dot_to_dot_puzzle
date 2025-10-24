'use client';

import { Card } from '@/components/ui/card';
import { Upload, Palette, Download } from 'lucide-react';
import ImageUploader from '@/components/upload/ImageUploader';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 mb-16">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          점잇기 퍼즐 생성기
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          사랑하는 딸을 위한 특별한 선물
          <br />
          이미지를 업로드하면 자동으로 점잇기 퍼즐을 만들어드립니다
        </p>
      </div>

      {/* Image Uploader */}
      <div className="max-w-2xl mx-auto mb-16">
        <ImageUploader />
      </div>

      {/* How it Works */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">사용 방법</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">1. 이미지 업로드</h3>
            <p className="text-sm text-muted-foreground">
              단순한 배경의 캐릭터나 동물 이미지를 업로드하세요
            </p>
          </Card>

          <Card className="p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">2. 난이도 조절</h3>
            <p className="text-sm text-muted-foreground">
              슬라이더로 점의 개수를 조절하여 난이도를 설정하세요
            </p>
          </Card>

          <Card className="p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">3. 다운로드</h3>
            <p className="text-sm text-muted-foreground">
              완성된 퍼즐을 PNG 파일로 다운로드하여 출력하세요
            </p>
          </Card>
        </div>
      </div>

      {/* Tips */}
      <div className="max-w-2xl mx-auto mt-16 p-6 bg-muted rounded-lg">
        <h3 className="font-semibold text-lg mb-4">💡 팁</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✅ 배경이 단색인 이미지가 가장 좋습니다</li>
          <li>✅ 대상과 배경의 대비가 뚜렷한 이미지를 사용하세요</li>
          <li>✅ 하나의 명확한 주제가 있는 이미지를 선택하세요</li>
          <li>❌ 복잡한 배경이나 여러 대상이 있는 이미지는 피하세요</li>
        </ul>
      </div>
    </div>
  );
}
