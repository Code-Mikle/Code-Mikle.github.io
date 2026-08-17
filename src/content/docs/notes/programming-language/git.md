---
title: Git
---

1. 创建分支

   ```bash
   git branch <branch-name>
   ```

2. 切换到新分支

   ```bash
   git checkout <branch-name>
   // 或者
   git switch <branch-name>
   ```

3. 将更改提交到分支

   ```bash
   git add .
   git commit -m "your commit message"
   ```

4. 将分支推送到远程仓库

   ```bash
   git push origin <branch-name>
   ```

5. 合并分支

   先切换回你想要合并到的主分支（通常是 main 或 master），然后执行合并命令

   ```bash
   git checkout main
   git merge <branch-name>
   // 或者
   git switch main
   git merge <branch-name>
   ```

6. 删除分支

   当分支完成任务后，可以删除本地或远程分支

   ```bash
   git branch -d <branch-name>  # 本地删除
   git push origin --delete <branch-name>  # 远程删除
   ```

7. 打标签

   ```bash
   git tag -a v1.0 -m "Version 1.0"
   git push origin v1.0
   ```

   
