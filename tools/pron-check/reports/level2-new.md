# 第 2 關新檔（v1.4.9）判決（自動產生）

```
FAIL    new-l2/22-喔喔                               預期[wo1 wo1]  whisper:「我...」0.2 | breeze:「我」0.2
          whisper：預期 wo1，聽成 （沒聽到）（音節不同）；whisper：預期 wo1，聽成 wo3（聲調不同）；breeze：預期 wo1，聽成 （沒聽到）（音節不同）；breeze：預期 wo1，聽成 wo3（聲調不同）
```
```
PASS    new-l2/24-飛機                               預期[fei1 ji1]  whisper:「飞机」1.0 | breeze:「飛機」1.0
          兩家 ASR 音節＋聲調吻合；F0 聲調相符
```
```
SUSPECT new-l2/27-ㄅ只有一個小勾勾，ㄆ下面有兩隻交叉的腳。             預期[zhi3 you3 yi1 ge4 xiao3 gou1 gou1 xia4 mian4 you3 liang3 zhi1 jiao1 cha1 de5 jiao3]  whisper:「只有一个小狗狗下面有两只交叉的脚」0.89 | breeze:「噗只有一個小狗狗噗下面有兩隻交叉的角」0.93
          whisper：預期 gou1，聽成 gou3（聲調不同）；whisper：預期 gou1，聽成 gou3（聲調不同）；whisper：預期 zhi1，聽成 zhi3（聲調不同）；breeze：預期 gou1，聽成 gou3（聲調不同）；breeze：預期 gou1，聽成 gou3（聲調不同）；兩家 ASR 在同一音節都聽成不同音／不同調：gou1、gou1
```
```
SUSPECT new-l2/28-哪個是爬的ㄆ？                          預期[na3 ge4 shi4 pa2 de5]  whisper:「那個是啪的啪」0.88 | breeze:「那個是趴的」0.88
          whisper：預期 pa2，聽成 pa1（聲調不同）；breeze：預期 pa2，聽成 pa1（聲調不同）；兩家 ASR 在同一音節都聽成不同音／不同調：pa2
```
```
SUSPECT new-l2/29-再看看，ㄆ有交叉的腳喔                      預期[zai4 kan4 kan4 you3 jiao1 cha1 de5 jiao3 o1]  whisper:「再看看噗又交叉地叫我」0.69 | breeze:「再看看又交�的叫我」0.69
          whisper：預期 you3，聽成 you4（聲調不同）；whisper：預期 de5，聽成 di4（音節不同）；whisper：預期 jiao3，聽成 jiao4（聲調不同）；whisper：預期 o1，聽成 wo3（聲調不同）；breeze：預期 you3，聽成 you4（聲調不同）；breeze：預期 cha1，聽成 （沒聽到）（音節不同）；breeze：預期 jiao3，聽成 jiao4（聲調不同）；breeze：預期 o1，聽成 wo3（聲調不同）；ASR 結果介於可信與不可信之間
```
```
FAIL    new-l2/33-髮                                預期[fa3]  whisper:「頭髮的髮」0.25 | breeze:「頭髮的髮」0.25
          whisper：多出音節 tou2 fa4 de5；breeze：多出音節 tou2 fa4 de5
```
```
SUSPECT new-l2/35-八                                預期[ba1]  whisper:「吧」1.0 | breeze:「大」0.0
          breeze：預期 ba1，聽成 da4（音節不同）；聲調：ba1 F0 輪廓為「降」（Δ-4.7st），與預期 1 聲不符
```
```
SUSPECT new-l2/38-ㄚㄚㄚ，阿公笑哈哈                        預期[a1 gong1 xiao4 ha1 ha1]  whisper:「啊 啊 啊阿公小哈哈」0.88 | breeze:「啊阿公小哈哈」0.88
          whisper：預期 xiao4，聽成 xiao3（聲調不同）；breeze：預期 xiao4，聽成 xiao3（聲調不同）；兩家 ASR 在同一音節都聽成不同音／不同調：xiao4
```
```
SUSPECT new-l2/39-ㄛㄛㄛ，公雞喔喔叫                        預期[gong1 ji1 wo1 wo1 jiao4]  whisper:「哦哦哦哦攻擊我我叫」0.76 | breeze:「喔喔喔喔喔喔喔喔攻擊我我叫」0.76
          whisper：預期 wo1，聽成 wo3（聲調不同）；whisper：預期 wo1，聽成 wo3（聲調不同）；breeze：預期 wo1，聽成 wo3（聲調不同）；breeze：預期 wo1，聽成 wo3（聲調不同）；ASR 結果介於可信與不可信之間
```
```
SUSPECT new-l2/40-ㄆㄆㄆ，葡萄一串串                        預期[pu2 tao2 yi1 chuan4 chuan4]  whisper:「噗 噗 噗不到一串串」0.68 | breeze:「噴噴噴葡萄一串串」1.0
          whisper：預期 pu2，聽成 pu1（聲調不同）；whisper：預期 tao2，聽成 dao4（音節不同）；ASR 結果介於可信與不可信之間
```
```
PASS    new-l2/41-ㄈㄈㄈ，飛機飛高高                        預期[fei1 ji1 fei1 gao1 gao1]  whisper:「飛機飛高高」1.0 | breeze:「飛機飛高高」1.0
          兩家 ASR 音節＋聲調吻合
```
```
SUSPECT new-l2/48-拼起來是什麼？                          預期[pin1 qi3 lai2 shi4 shen2 me5]  whisper:「評起來是什麼?」0.88 | breeze:「憑起來是什麼」0.88
          whisper：預期 pin1，聽成 ping2（聲調不同）；breeze：預期 pin1，聽成 ping2（聲調不同）；兩家 ASR 在同一音節都聽成不同音／不同調：pin1
```
```
PASS    new-l2/49-要怎麼拼？                            預期[yao4 zen3 me5 pin1]  whisper:「要怎麼拼」1.0 | breeze:「要怎麼評」0.81
          breeze：預期 pin1，聽成 ping2（聲調不同）
```